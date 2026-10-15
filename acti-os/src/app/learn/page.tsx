import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { QueryBanner } from "@/components/courses/query-banner";
import { readQueryMessage } from "@/lib/courses/form";
import { completionSummary, continueTarget } from "@/lib/courses/progress";
import { createClient } from "@/lib/supabase/server";
import type {
  AssessmentAttempt,
  AssessmentOutline,
  CourseEnrolment,
  LessonOutline,
  LessonProgress,
  ShortCourse,
} from "@/lib/courses/types";
import { cn } from "@/lib/utils";

export default async function LearnHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: enrolmentRows, error } = await supabase
    .from("course_enrolments")
    .select("*")
    .eq("user_id", profile.id)
    .order("enrolled_at", { ascending: false });

  const enrolments = (enrolmentRows ?? []) as CourseEnrolment[];
  const courseIds = enrolments.map((enrolment) => enrolment.course_id);
  const enrolmentIds = enrolments.map((enrolment) => enrolment.id);

  const [coursesRes, modulesRes, lessonsRes, progressRes, assessmentRes, attemptRes] =
    courseIds.length
      ? await Promise.all([
          supabase.from("short_courses").select("*").in("id", courseIds),
          supabase.from("course_modules").select("id, course_id, title, sort_order").in("course_id", courseIds),
          supabase
            .from("course_lessons")
            .select("id, course_id, module_id, title, slug, summary, lesson_type, estimated_minutes, is_required, sort_order, publication_status")
            .in("course_id", courseIds),
          supabase.from("lesson_progress").select("*").in("enrolment_id", enrolmentIds),
          supabase.from("published_assessment_outlines").select("*").in("course_id", courseIds),
          supabase.from("assessment_attempts").select("*").in("enrolment_id", enrolmentIds),
        ])
      : [];

  const courses = ((coursesRes?.data ?? []) as ShortCourse[]);
  const modules = (modulesRes?.data ?? []) as {
    id: string;
    course_id: string;
    title: string;
    sort_order: number;
  }[];
  const lessonRows = (lessonsRes?.data ?? []) as (Omit<LessonOutline, "module_title" | "module_sort" | "summary"> & {
    summary: string;
    publication_status: string;
    module_id: string;
  })[];
  const progress = (progressRes?.data ?? []) as LessonProgress[];
  const assessments = (assessmentRes?.data ?? []) as AssessmentOutline[];
  const attempts = (attemptRes?.data ?? []) as AssessmentAttempt[];
  const unavailable = Boolean(error);

  const cards = enrolments.map((enrolment) => {
    const course = courses.find((item) => item.id === enrolment.course_id);
    if (!course) return null;
    const outlines: LessonOutline[] = lessonRows
      .filter(
        (lesson) =>
          lesson.course_id === course.id && lesson.publication_status === "published",
      )
      .map((lesson) => {
        const parent = modules.find((item) => item.id === lesson.module_id);
        return {
          ...lesson,
          module_title: parent?.title ?? "Module",
          module_sort: parent?.sort_order ?? 0,
        };
      });
    const courseAssessments = assessments.filter((item) => item.course_id === course.id);
    const completed = new Set(
      progress.filter((item) => item.enrolment_id === enrolment.id).map((item) => item.lesson_id),
    );
    const passed = new Set(
      attempts
        .filter((item) => item.enrolment_id === enrolment.id && item.passed)
        .map((item) => item.assessment_id),
    );
    const summary = completionSummary(outlines, courseAssessments, completed, passed);
    const next = continueTarget({
      courseSlug: course.slug,
      lessons: outlines,
      completedLessonIds: completed,
      lastLessonId: enrolment.last_lesson_id,
      assessments: courseAssessments,
      passedAssessmentIds: passed,
    });
    const lastLesson = outlines.find((lesson) => lesson.id === enrolment.last_lesson_id);
    const outstanding = [
      ...outlines
        .filter((lesson) => lesson.is_required && !completed.has(lesson.id))
        .map((lesson) => lesson.title),
      ...courseAssessments
        .filter((item) => item.is_required && !passed.has(item.id))
        .map((item) => item.title),
    ];
    return { enrolment, course, summary, next, lastLesson, outstanding };
  }).filter((item) => item !== null);

  const completedCards = cards.filter((card) => card.summary.complete);
  const activeCards = cards.filter((card) => !card.summary.complete);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">My learning</h1>
        <p className="mt-2 text-muted-foreground">
          Short courses you are enrolled in. Progress counts required lessons and course checks, not video playback.
        </p>
      </div>
      <QueryBanner
        error={readQueryMessage(params.error)}
        notice={readQueryMessage(params.notice)}
      />
      {unavailable && (
        <p className="rounded-xl border bg-white/80 px-4 py-6 text-sm text-muted-foreground">
          Learning records are not available yet. Apply the latest database migration, then reload this page.
        </p>
      )}
      {!unavailable && cards.length === 0 && (
        <div className="rounded-xl border bg-white/80 p-6">
          <p className="text-sm leading-6 text-muted-foreground">
            You have not enrolled in a short course yet.
          </p>
          <Link href="/short-courses" className={cn(buttonVariants(), "mt-4")}>
            Browse short courses
          </Link>
        </div>
      )}
      {activeCards.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">In progress</h2>
          <ul className="space-y-4">
            {activeCards.map((card) => (
              <li key={card.enrolment.id} className="rounded-xl border bg-white/80 p-5">
                <CourseProgressCard {...card} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {completedCards.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Completed</h2>
          <ul className="space-y-4">
            {completedCards.map((card) => (
              <li key={card.enrolment.id} className="rounded-xl border bg-white/80 p-5">
                <CourseProgressCard {...card} />
                {card.course.certificate_enabled && (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    You have met the completion requirements. A downloadable ACTI certificate of completion is not available yet.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="rounded-xl border bg-white/80 p-5">
        <h2 className="font-display text-lg font-semibold">Sessions and checks</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No live or physical sessions are scheduled. Outstanding course checks are listed on each course above.
        </p>
      </section>
    </div>
  );
}

function CourseProgressCard({
  course,
  summary,
  next,
  lastLesson,
  outstanding,
}: {
  course: ShortCourse;
  summary: { percent: number; done: number; total: number };
  next: { href: string; label: string };
  lastLesson?: LessonOutline;
  outstanding: string[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-primary">{course.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.done} of {summary.total} required parts · {summary.percent}%
          </p>
          {lastLesson && (
            <p className="mt-1 text-sm text-muted-foreground">Last lesson: {lastLesson.title}</p>
          )}
        </div>
        <Link href={next.href} className={cn(buttonVariants())}>
          {next.label}
        </Link>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={summary.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${course.title} progress`}
      >
        <div className="h-full bg-brand-teal" style={{ width: `${summary.percent}%` }} />
      </div>
      {outstanding.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Still to do: {outstanding.slice(0, 3).join(", ")}
          {outstanding.length > 3 ? "…" : ""}
        </p>
      )}
    </div>
  );
}
