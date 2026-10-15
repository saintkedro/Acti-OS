"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSlug, isUuid } from "@/lib/courses/form";
import { createClient } from "@/lib/supabase/server";

function friendlyRpc(message: string) {
  if (message.includes("Attempt limit")) return "You have used every attempt for this check.";
  if (message.includes("Enrolment required") || message.includes("No active enrolment")) {
    return "Enrol in this course before you continue.";
  }
  if (message.includes("not available") || message.includes("not found")) {
    return "That activity is not available.";
  }
  return "That action could not be completed. Try again.";
}

function coursePath(slug: string) {
  return `/short-courses/${slug}`;
}

export async function enrolInFreeCourse(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!isUuid(courseId) || !isSlug(slug)) {
    redirect("/short-courses?error=That%20course%20could%20not%20be%20found.");
  }

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(coursePath(slug))}`);

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("short_courses")
    .select("id, slug, title, is_free, publication_status, coming_soon")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || course.slug !== slug || course.publication_status !== "published") {
    redirect("/short-courses?error=That%20course%20is%20not%20open%20for%20enrolment.");
  }

  if (course.coming_soon) {
    redirect(
      `${coursePath(slug)}?error=${encodeURIComponent("This course is not open for enrolment yet.")}`,
    );
  }

  if (!course.is_free) {
    redirect(
      `${coursePath(slug)}?error=${encodeURIComponent("Paid enrolment is not open yet. This course stays closed until payment confirmation is connected.")}`,
    );
  }

  const { error } = await supabase.from("course_enrolments").insert({
    user_id: profile.id,
    course_id: course.id,
    status: "active",
  });

  if (error && error.code !== "23505") {
    redirect(
      `${coursePath(slug)}?error=${encodeURIComponent("Enrolment could not be completed. Try again.")}`,
    );
  }

  if (!error) {
    await supabase.from("notifications").insert({
      user_id: profile.id,
      title: "You are enrolled",
      body: `You can start ${course.title} from My learning.`,
      link: `/learn/${course.slug}`,
    });
  }

  revalidatePath("/learn");
  revalidatePath(`/learn/${course.slug}`);
  redirect(`/learn/${course.slug}?notice=${encodeURIComponent("You are enrolled. Start with the first lesson.")}`);
}

export async function completeLesson(formData: FormData) {
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const lessonSlug = String(formData.get("lessonSlug") ?? "");
  if (!isUuid(lessonId) || !isSlug(courseSlug) || !isSlug(lessonSlug)) {
    redirect("/learn");
  }

  const path = `/learn/${courseSlug}/lessons/${lessonSlug}`;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(path)}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_lesson", { p_lesson_id: lessonId });
  if (error) {
    redirect(`${path}?error=${encodeURIComponent(friendlyRpc(error.message))}`);
  }

  revalidatePath("/learn");
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath(path);
  redirect(`${path}?notice=${encodeURIComponent("Lesson marked complete.")}`);
}

export async function submitQuiz(formData: FormData) {
  const assessmentId = String(formData.get("assessmentId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  if (!isUuid(assessmentId) || !isSlug(courseSlug)) redirect("/learn");

  const path = `/learn/${courseSlug}/assessments/${assessmentId}`;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(path)}`);

  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("q_") || typeof value !== "string") continue;
    const questionId = key.slice(2);
    if (isUuid(questionId) && isUuid(value)) answers[questionId] = value;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_assessment_attempt", {
    p_assessment_id: assessmentId,
    p_answers: answers,
  });

  if (error) {
    redirect(`${path}?error=${encodeURIComponent(friendlyRpc(error.message))}`);
  }

  const attemptId = (data as { attempt_id?: string } | null)?.attempt_id;
  revalidatePath("/learn");
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath(path);
  redirect(attemptId && isUuid(attemptId) ? `${path}?attempt=${attemptId}` : path);
}
