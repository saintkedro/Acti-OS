import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { QueryBanner } from "@/components/courses/query-banner";
import { enrolInFreeCourse } from "@/lib/courses/actions";
import { readQueryMessage } from "@/lib/courses/form";
import { LESSON_TYPE_LABELS } from "@/lib/courses/labels";
import { completionSummary, continueTarget, groupLessons } from "@/lib/courses/progress";
import {
  getAttempts,
  getCourseBySlug,
  getEnrolment,
  getLessonProgress,
  getPublishedOutlines,
  getReadableCourseTree,
} from "@/lib/courses/queries";
import type { LessonOutline } from "@/lib/courses/types";
import { cn } from "@/lib/utils";

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const profile = await requireProfile();
  const { course } = await getCourseBySlug(slug);
  if (!course) notFound();
  if (course.publication_status !== "published" && profile.role !== "admin") notFound();

  const enrolment = await getEnrolment(profile.id, course.id);
  const canOpenLessons = Boolean(enrolment) || profile.role === "admin";
  const tree = canOpenLessons ? await getReadableCourseTree(course.id) : null;
  const published = canOpenLessons ? null : await getPublishedOutlines(course.id);
  const outlines: LessonOutline[] = tree
    ? tree.outlines.filter((outline) => {
        const lesson = tree.lessons.find((item) => item.id === outline.id);
        return lesson?.publication_status === "published" || profile.role === "admin";
      })
    : (published?.lessons ?? []);
  const assessments = published?.assessments ?? (await getPublishedOutlines(course.id)).assessments;
  const progress = enrolment ? await getLessonProgress(enrolment.id) : [];
  const attempts = enrolment ? await getAttempts(enrolment.id) : [];
  const completed = new Set(progress.map((item) => item.lesson_id));
  const passed = new Set(attempts.filter((item) => item.passed).map((item) => item.assessment_id));
  const summary = completionSummary(outlines.filter((lesson) => {
    const row = tree?.lessons.find((item) => item.id === lesson.id);
    return !row || row.publication_status === "published";
  }), assessments, completed, passed);
  const next = continueTarget({
    courseSlug: course.slug,
    lessons: outlines.filter((lesson) => {
      const row = tree?.lessons.find((item) => item.id === lesson.id);
      return !row || row.publication_status === "published";
    }),
    completedLessonIds: completed,
    lastLessonId: enrolment?.last_lesson_id ?? null,
    assessments,
    passedAssessmentIds: passed,
  });
  const groups = groupLessons(outlines);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{course.code}</p>
        <h1 className="font-display text-3xl font-bold text-primary">{course.title}</h1>
        {course.publication_status !== "published" && (
          <p className="mt-2 text-sm text-muted-foreground">Admin preview. This course is not published.</p>
        )}
      </div>
      <QueryBanner error={readQueryMessage(query.error)} notice={readQueryMessage(query.notice)} />
      {enrolment && (
        <div className="rounded-xl border bg-white/80 p-4">
          <p className="text-sm text-muted-foreground">
            {summary.done} of {summary.total} required parts · {summary.percent}%
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={summary.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Course progress"
          >
            <div className="h-full bg-brand-teal" style={{ width: `${summary.percent}%` }} />
          </div>
          {summary.complete && course.certificate_enabled && (
            <p className="mt-3 text-sm leading-6">
              Required lessons and checks are complete. A downloadable ACTI certificate of completion is not available yet.
            </p>
          )}
          <Link href={next.href} className={cn(buttonVariants(), "mt-4")}>
            {next.label}
          </Link>
        </div>
      )}
      {!enrolment && course.is_free && course.publication_status === "published" && !course.coming_soon && (
        <form action={enrolInFreeCourse}>
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="slug" value={course.slug} />
          <button type="submit" className={cn(buttonVariants())}>
            Enrol for free
          </button>
        </form>
      )}
      {!enrolment && !course.is_free && (
        <p className="rounded-xl border bg-white/80 px-4 py-3 text-sm leading-6">
          Paid enrolment is not open yet. Lesson content stays closed until payment is confirmed.
        </p>
      )}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Lessons</h2>
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground">No published lessons yet.</p>
        )}
        {groups.map((group) => (
          <div key={group.id} className="rounded-xl border bg-white/80 p-4">
            <h3 className="font-semibold">{group.title}</h3>
            <ul className="mt-3 space-y-2">
              {group.lessons.map((lesson) => {
                const row = tree?.lessons.find((item) => item.id === lesson.id);
                const done = completed.has(lesson.id);
                const content = (
                  <>
                    <span className="font-medium">{lesson.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {LESSON_TYPE_LABELS[lesson.lesson_type]}
                      {done ? " · Done" : ""}
                      {row && row.publication_status !== "published" ? " · Draft" : ""}
                    </span>
                  </>
                );
                return (
                  <li key={lesson.id}>
                    {canOpenLessons ? (
                      <Link
                        href={`/learn/${course.slug}/lessons/${lesson.slug}`}
                        className="block rounded-md px-2 py-2 hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="px-2 py-2">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
      {assessments.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Course checks</h2>
          <ul className="space-y-2">
            {assessments.map((assessment) => {
              const best = attempts
                .filter((item) => item.assessment_id === assessment.id)
                .sort((a, b) => b.score_percent - a.score_percent)[0];
              return (
                <li key={assessment.id} className="rounded-xl border bg-white/80 p-4">
                  <p className="font-medium">{assessment.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pass mark {assessment.pass_mark_percent}%
                    {best ? ` · Best score ${best.score_percent}%` : ""}
                    {best?.passed ? " · Passed" : ""}
                  </p>
                  {canOpenLessons && enrolment && (
                    <Link
                      href={`/learn/${course.slug}/assessments/${assessment.id}`}
                      className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
                    >
                      Open check
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
