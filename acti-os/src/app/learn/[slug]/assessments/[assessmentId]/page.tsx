import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { QueryBanner } from "@/components/courses/query-banner";
import { submitQuiz } from "@/lib/courses/actions";
import { isUuid, readQueryMessage } from "@/lib/courses/form";
import { getCourseBySlug, getEnrolment } from "@/lib/courses/queries";
import type { AttemptFeedback, LearnerAssessment } from "@/lib/courses/types";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; assessmentId: string }>;
  searchParams: Promise<{ error?: string; attempt?: string }>;
}) {
  const { slug, assessmentId } = await params;
  const query = await searchParams;
  if (!isUuid(assessmentId)) notFound();

  const profile = await requireProfile();
  const { course } = await getCourseBySlug(slug);
  if (!course) notFound();
  if (course.publication_status !== "published" && profile.role !== "admin") notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_learner_assessment", {
    p_assessment_id: assessmentId,
  });

  if (error || !data) {
    if (course.publication_status === "published") {
      return (
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-bold text-primary">Course check</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Enrol in this course to open the check. Correct answers stay hidden until you submit.
          </p>
          <Link href={`/short-courses/${course.slug}`} className={cn(buttonVariants())}>
            View course
          </Link>
        </div>
      );
    }
    notFound();
  }

  const assessment = data as LearnerAssessment;
  if (assessment.course_id !== course.id) notFound();

  const enrolment = await getEnrolment(profile.id, course.id);
  const attemptsRemaining = assessment.attempt_limit - assessment.attempts_used;
  let feedback: AttemptFeedback[] = [];
  let score: number | null = null;
  let passed: boolean | null = null;

  if (query.attempt && isUuid(query.attempt) && enrolment) {
    const { data: attempt } = await supabase
      .from("assessment_attempts")
      .select("id, score_percent, passed, enrolment_id")
      .eq("id", query.attempt)
      .eq("enrolment_id", enrolment.id)
      .maybeSingle();

    if (attempt) {
      score = attempt.score_percent as number;
      passed = attempt.passed as boolean;
      const { data: review } = await supabase.rpc("get_attempt_feedback", {
        p_attempt_id: query.attempt,
      });
      feedback = (review ?? []) as AttemptFeedback[];
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href={`/learn/${course.slug}`} className="underline-offset-4 hover:underline">
            {course.title}
          </Link>
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-primary">{assessment.title}</h1>
        {assessment.instructions && (
          <p className="mt-3 text-sm leading-6">{assessment.instructions}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Pass mark {assessment.pass_mark_percent}%. Attempts used {assessment.attempts_used} of{" "}
          {assessment.attempt_limit}.
        </p>
      </div>
      <QueryBanner error={readQueryMessage(query.error)} />
      {score !== null && passed !== null && (
        <div className="rounded-xl border bg-white/80 p-4">
          <p className="font-medium">
            Score {score}%. {passed ? "Passed." : "Not passed yet."}
          </p>
          {feedback.length > 0 && (
            <ul className="mt-4 space-y-4">
              {feedback.map((item) => (
                <li key={item.question_id}>
                  <p className="font-medium">{item.prompt}</p>
                  <p className="mt-1 text-sm">
                    Your answer: {item.selected_label || "No answer"} ·{" "}
                    {item.correct ? "Correct" : "Not correct"}
                  </p>
                  {item.feedback && (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.feedback}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {attemptsRemaining > 0 && enrolment ? (
        <form action={submitQuiz} className="space-y-6">
          <input type="hidden" name="assessmentId" value={assessment.id} />
          <input type="hidden" name="courseSlug" value={course.slug} />
          {assessment.questions.map((question, index) => (
            <fieldset key={question.id} className="space-y-3 rounded-xl border bg-white/80 p-4">
              <legend className="px-1 font-medium">
                {index + 1}. {question.prompt}
              </legend>
              {question.options.map((option) => (
                <label key={option.id} className="flex items-start gap-3 text-sm leading-6">
                  <input
                    type="radio"
                    name={`q_${question.id}`}
                    value={option.id}
                    required
                    className="mt-1 size-4 accent-primary"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <button type="submit" className={cn(buttonVariants())}>
            Submit answers
          </button>
        </form>
      ) : enrolment ? (
        <p className="text-sm leading-6 text-muted-foreground">
          You have used every attempt for this check.
        </p>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          You can preview the questions. Enrol to submit an attempt.
        </p>
      )}
    </div>
  );
}
