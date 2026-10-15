"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import type { CourseDelivery, CourseStatus, LessonType } from "@/lib/courses/types";
import {
  codeify,
  isSlug,
  isUuid,
  queryError,
  readKobo,
  readRequired,
  readText,
  slugify,
} from "@/lib/courses/form";
import { DELIVERIES, LESSON_TYPES, COURSE_STATUSES } from "@/lib/courses/labels";
import { videoEmbed } from "@/lib/courses/video";
import { createClient } from "@/lib/supabase/server";
import type { ProgrammePillar } from "@/lib/types";

const PILLARS: ProgrammePillar[] = [
  "technology",
  "technical_vocational",
  "innovation_entrepreneurship",
];

async function adminClient() {
  await requireProfile(["admin"]);
  return createClient();
}

function fail(path: string, message: string): never {
  redirect(queryError(path, message));
}

function revalidateCourse(id: string, slug?: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/short-courses");
  revalidatePath("/learn");
  if (slug) {
    revalidatePath(`/short-courses/${slug}`);
    revalidatePath(`/learn/${slug}`);
  }
}

function readPillar(value: string): ProgrammePillar | null {
  return PILLARS.includes(value as ProgrammePillar) ? (value as ProgrammePillar) : null;
}

function readDelivery(value: string): CourseDelivery | null {
  return DELIVERIES.includes(value as CourseDelivery) ? (value as CourseDelivery) : null;
}

function readStatus(value: string): CourseStatus | null {
  return COURSE_STATUSES.includes(value as CourseStatus) ? (value as CourseStatus) : null;
}

function readLessonType(value: string): LessonType | null {
  return LESSON_TYPES.includes(value as LessonType) ? (value as LessonType) : null;
}

function courseFields(formData: FormData) {
  const title = readRequired(formData, "title", 160, "Title");
  if (title.error) return { error: title.error };
  const code = codeify(readText(formData, "code", 20));
  if (!code) return { error: "Course code is required." };
  const slugSource = readText(formData, "slug", 80) || title.value;
  const slug = slugify(slugSource);
  if (!isSlug(slug)) return { error: "Use a slug made of lowercase letters, numbers, and hyphens." };
  const pillar = readPillar(readText(formData, "pillar", 40));
  if (!pillar) return { error: "Choose a programme pillar." };
  const delivery = readDelivery(readText(formData, "delivery", 20));
  if (!delivery) return { error: "Choose a delivery format." };
  const isFree = formData.get("is_free") === "on";
  const price = readKobo(readText(formData, "price_naira", 12));
  if (price === null) return { error: "Enter the fee in naira, or leave it blank." };
  if (isFree && price !== 0) return { error: "A free course cannot have a fee." };
  const outcomes = readText(formData, "outcomes", 4000)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  return {
    error: null,
    values: {
      title: title.value,
      code,
      slug,
      pillar,
      summary: readText(formData, "summary", 400),
      description: readText(formData, "description", 8000),
      outcomes,
      audience: readText(formData, "audience", 800),
      prerequisites: readText(formData, "prerequisites", 800),
      duration_label: readText(formData, "duration_label", 80),
      instructor_name: readText(formData, "instructor_name", 120) || "ACTI short-course team",
      instructor_bio: readText(formData, "instructor_bio", 800),
      keywords: readText(formData, "keywords", 300),
      delivery_format: delivery,
      is_free: isFree,
      price_kobo: isFree ? 0 : price,
      coming_soon: formData.get("coming_soon") === "on",
      certificate_enabled: formData.get("certificate_enabled") === "on",
    },
  };
}

export async function createCourse(formData: FormData) {
  const supabase = await adminClient();
  const parsed = courseFields(formData);
  if (parsed.error || !parsed.values) fail("/admin/courses/new", parsed.error ?? "Check the form.");

  const { data, error } = await supabase
    .from("short_courses")
    .insert({ ...parsed.values, publication_status: "draft" })
    .select("id")
    .single();

  if (error || !data) {
    fail(
      "/admin/courses/new",
      error?.code === "23505"
        ? "That code or slug is already used."
        : "The course could not be saved.",
    );
  }

  revalidateCourse(data.id, parsed.values.slug);
  redirect(`/admin/courses/${data.id}?notice=${encodeURIComponent("Draft saved.")}`);
}

export async function updateCourse(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("courseId") ?? "");
  if (!isUuid(id)) fail("/admin/courses", "Course not found.");
  const parsed = courseFields(formData);
  const path = `/admin/courses/${id}`;
  if (parsed.error || !parsed.values) fail(path, parsed.error ?? "Check the form.");

  if (parsed.values.is_free === false) {
    const { data: existing } = await supabase
      .from("short_courses")
      .select("publication_status")
      .eq("id", id)
      .maybeSingle();
    if (existing?.publication_status === "published") {
      fail(path, "Unpublish this course before turning it into a paid course. Paid enrolment is not open yet.");
    }
  }

  const { error } = await supabase.from("short_courses").update(parsed.values).eq("id", id);
  if (error) {
    fail(path, error.code === "23505" ? "That code or slug is already used." : "The course could not be saved.");
  }

  revalidateCourse(id, parsed.values.slug);
  redirect(`${path}?notice=${encodeURIComponent("Course saved.")}`);
}

export async function setCourseStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = String(formData.get("courseId") ?? "");
  const status = readStatus(String(formData.get("status") ?? ""));
  if (!isUuid(id) || !status) fail("/admin/courses", "Course not found.");
  const path = `/admin/courses/${id}`;

  const { data: course } = await supabase
    .from("short_courses")
    .select("id, slug, is_free, price_kobo, publication_status")
    .eq("id", id)
    .maybeSingle();

  if (!course) fail("/admin/courses", "Course not found.");

  if (status === "published") {
    if (!course.is_free || course.price_kobo > 0) {
      fail(
        path,
        "Paid enrolment is not open yet. Keep this course in draft until payment confirmation is connected.",
      );
    }
    const { count } = await supabase
      .from("course_lessons")
      .select("id", { count: "exact", head: true })
      .eq("course_id", id)
      .eq("publication_status", "published");
    if (!count) fail(path, "Publish at least one lesson before publishing the course.");
  }

  const { error } = await supabase
    .from("short_courses")
    .update({ publication_status: status })
    .eq("id", id);

  if (error) fail(path, "The status could not be changed.");
  revalidateCourse(id, course.slug);
  redirect(`${path}?notice=${encodeURIComponent("Status updated.")}`);
}

export async function addModule(formData: FormData) {
  const supabase = await adminClient();
  const courseId = String(formData.get("courseId") ?? "");
  if (!isUuid(courseId)) fail("/admin/courses", "Course not found.");
  const path = `/admin/courses/${courseId}`;
  const title = readRequired(formData, "title", 160, "Module title");
  if (title.error) fail(path, title.error);

  const { count } = await supabase
    .from("course_modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { error } = await supabase.from("course_modules").insert({
    course_id: courseId,
    title: title.value,
    summary: readText(formData, "summary", 400),
    sort_order: (count ?? 0) + 1,
  });

  if (error) fail(path, "The module could not be added.");
  revalidateCourse(courseId);
  redirect(`${path}?notice=${encodeURIComponent("Module added.")}`);
}

export async function addLesson(formData: FormData) {
  const supabase = await adminClient();
  const courseId = String(formData.get("courseId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  if (!isUuid(courseId) || !isUuid(moduleId)) fail("/admin/courses", "Course not found.");
  const path = `/admin/courses/${courseId}`;
  const title = readRequired(formData, "title", 160, "Lesson title");
  if (title.error) fail(path, title.error);
  const slug = slugify(readText(formData, "slug", 80) || title.value);
  if (!isSlug(slug)) fail(path, "Use a lesson slug of lowercase letters, numbers, and hyphens.");
  const lessonType = readLessonType(readText(formData, "lesson_type", 40));
  if (!lessonType) fail(path, "Choose a lesson type.");
  const videoUrl = readText(formData, "video_url", 2000);
  if (videoUrl && videoEmbed(videoUrl).kind === "invalid") {
    fail(path, "Video links must be https YouTube, Vimeo, MP4, or WebM addresses.");
  }
  const status = readStatus(readText(formData, "publication_status", 20)) ?? "draft";

  const { count } = await supabase
    .from("course_lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  const { error } = await supabase.from("course_lessons").insert({
    module_id: moduleId,
    course_id: courseId,
    title: title.value,
    slug,
    summary: readText(formData, "summary", 400),
    lesson_type: lessonType,
    body: readText(formData, "body", 20000),
    video_url: videoUrl || null,
    transcript: readText(formData, "transcript", 8000) || null,
    estimated_minutes: Number(readText(formData, "estimated_minutes", 4) || "0") || 0,
    is_required: formData.get("is_required") === "on",
    sort_order: (count ?? 0) + 1,
    publication_status: status,
  });

  if (error) {
    fail(path, error.code === "23505" ? "That lesson slug is already used in this course." : "The lesson could not be added.");
  }
  revalidateCourse(courseId);
  redirect(`${path}?notice=${encodeURIComponent("Lesson added.")}`);
}

export async function updateLesson(formData: FormData) {
  const supabase = await adminClient();
  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!isUuid(courseId) || !isUuid(lessonId)) fail("/admin/courses", "Lesson not found.");
  const path = `/admin/courses/${courseId}`;
  const title = readRequired(formData, "title", 160, "Lesson title");
  if (title.error) fail(path, title.error);
  const slug = slugify(readText(formData, "slug", 80));
  if (!isSlug(slug)) fail(path, "Use a lesson slug of lowercase letters, numbers, and hyphens.");
  const lessonType = readLessonType(readText(formData, "lesson_type", 40));
  if (!lessonType) fail(path, "Choose a lesson type.");
  const videoUrl = readText(formData, "video_url", 2000);
  if (videoUrl && videoEmbed(videoUrl).kind === "invalid") {
    fail(path, "Video links must be https YouTube, Vimeo, MP4, or WebM addresses.");
  }
  const status = readStatus(readText(formData, "publication_status", 20));
  if (!status) fail(path, "Choose a lesson status.");
  const minutes = Number(readText(formData, "estimated_minutes", 4) || "0");
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 600) {
    fail(path, "Estimated minutes must be a whole number from 0 to 600.");
  }

  const { error } = await supabase
    .from("course_lessons")
    .update({
      title: title.value,
      slug,
      summary: readText(formData, "summary", 400),
      lesson_type: lessonType,
      body: readText(formData, "body", 20000),
      video_url: videoUrl || null,
      transcript: readText(formData, "transcript", 8000) || null,
      estimated_minutes: minutes,
      is_required: formData.get("is_required") === "on",
      sort_order: Number(readText(formData, "sort_order", 4) || "1") || 1,
      publication_status: status,
    })
    .eq("id", lessonId)
    .eq("course_id", courseId);

  if (error) {
    fail(path, error.code === "23505" ? "That lesson slug is already used in this course." : "The lesson could not be saved.");
  }
  revalidateCourse(courseId);
  redirect(`${path}?notice=${encodeURIComponent("Lesson saved.")}`);
}

export async function addResource(formData: FormData) {
  const supabase = await adminClient();
  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!isUuid(courseId) || !isUuid(lessonId)) fail("/admin/courses", "Lesson not found.");
  const path = `/admin/courses/${courseId}`;
  const title = readRequired(formData, "title", 160, "Resource title");
  if (title.error) fail(path, title.error);
  const url = readText(formData, "external_url", 2000);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    fail(path, "Resource links must start with https://");
  }
  if (parsed.protocol !== "https:") fail(path, "Resource links must start with https://");

  const { error } = await supabase.from("lesson_resources").insert({
    lesson_id: lessonId,
    title: title.value,
    external_url: parsed.toString(),
  });
  if (error) fail(path, "The resource could not be added.");
  revalidateCourse(courseId);
  redirect(`${path}?notice=${encodeURIComponent("Resource added.")}`);
}

export async function addAssessment(formData: FormData) {
  const supabase = await adminClient();
  const courseId = String(formData.get("courseId") ?? "");
  if (!isUuid(courseId)) fail("/admin/courses", "Course not found.");
  const path = `/admin/courses/${courseId}`;
  const title = readRequired(formData, "title", 160, "Check title");
  if (title.error) fail(path, title.error);
  const passMark = Number(readText(formData, "pass_mark_percent", 3) || "60");
  const attemptLimit = Number(readText(formData, "attempt_limit", 2) || "3");
  if (!Number.isInteger(passMark) || passMark < 1 || passMark > 100) {
    fail(path, "Pass mark must be from 1 to 100.");
  }
  if (!Number.isInteger(attemptLimit) || attemptLimit < 1 || attemptLimit > 20) {
    fail(path, "Attempt limit must be from 1 to 20.");
  }

  const { error } = await supabase.from("course_assessments").insert({
    course_id: courseId,
    title: title.value,
    instructions: readText(formData, "instructions", 1000),
    pass_mark_percent: passMark,
    attempt_limit: attemptLimit,
    is_required: formData.get("is_required") === "on",
    publication_status: "published",
  });
  if (error) fail(path, "The check could not be added.");
  revalidateCourse(courseId);
  redirect(`${path}?notice=${encodeURIComponent("Course check added.")}`);
}

export async function addQuestion(formData: FormData) {
  const supabase = await adminClient();
  const courseId = String(formData.get("courseId") ?? "");
  const assessmentId = String(formData.get("assessmentId") ?? "");
  if (!isUuid(courseId) || !isUuid(assessmentId)) fail("/admin/courses", "Check not found.");
  const path = `/admin/courses/${courseId}`;
  const prompt = readRequired(formData, "prompt", 2000, "Question");
  if (prompt.error) fail(path, prompt.error);
  const questionType = readText(formData, "question_type", 40);
  if (questionType !== "multiple_choice" && questionType !== "true_false") {
    fail(path, "Choose multiple choice or true/false.");
  }

  const { data: assessment } = await supabase
    .from("course_assessments")
    .select("id")
    .eq("id", assessmentId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!assessment) fail(path, "Check not found.");

  const options = [1, 2, 3, 4]
    .map((index) => ({ index, label: readText(formData, `option${index}`, 500) }))
    .filter((option) => option.label);
  const correct = Number(formData.get("correct"));
  if (options.length < 2 || !options.some((option) => option.index === correct)) {
    fail(path, "Add at least two answers and mark the correct one.");
  }

  const { count } = await supabase
    .from("assessment_questions")
    .select("id", { count: "exact", head: true })
    .eq("assessment_id", assessmentId);

  const { data: question, error } = await supabase
    .from("assessment_questions")
    .insert({
      assessment_id: assessmentId,
      prompt: prompt.value,
      question_type: questionType,
      explanation: readText(formData, "explanation", 1000) || null,
      sort_order: (count ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error || !question) fail(path, "The question could not be added.");

  const { error: optionError } = await supabase.from("assessment_options").insert(
    options.map((option, index) => ({
      question_id: question.id,
      label: option.label,
      is_correct: option.index === correct,
      sort_order: index + 1,
    })),
  );

  if (optionError) fail(path, "The answers could not be saved.");
  revalidateCourse(courseId);
  redirect(`${path}?notice=${encodeURIComponent("Question added.")}`);
}
