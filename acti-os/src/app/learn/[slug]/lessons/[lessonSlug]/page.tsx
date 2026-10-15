import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { LessonBody, LessonVideo } from "@/components/courses/lesson-content";
import { QueryBanner } from "@/components/courses/query-banner";
import { completeLesson } from "@/lib/courses/actions";
import { readQueryMessage } from "@/lib/courses/form";
import { LESSON_TYPE_LABELS } from "@/lib/courses/labels";
import { groupLessons, orderLessons } from "@/lib/courses/progress";
import {
  getCourseBySlug,
  getEnrolment,
  getLessonProgress,
  getLessonResources,
  getReadableCourseTree,
} from "@/lib/courses/queries";
import { safeHttpsUrl } from "@/lib/courses/video";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const query = await searchParams;
  const profile = await requireProfile();
  const { course } = await getCourseBySlug(slug);
  if (!course) notFound();
  if (course.publication_status !== "published" && profile.role !== "admin") notFound();

  const enrolment = await getEnrolment(profile.id, course.id);
  const tree = await getReadableCourseTree(course.id);
  const lesson = tree.lessons.find((item) => item.slug === lessonSlug);
  if (!lesson) {
    if (course.publication_status === "published") {
      redirect(`/short-courses/${course.slug}?error=${encodeURIComponent("Enrol to open this lesson.")}`);
    }
    notFound();
  }

  if (enrolment && lesson.publication_status === "published") {
    const supabase = await createClient();
    await supabase.rpc("record_lesson_visit", { p_lesson_id: lesson.id });
  }

  const [resources, progress] = await Promise.all([
    getLessonResources(lesson.id),
    enrolment ? getLessonProgress(enrolment.id) : Promise.resolve([]),
  ]);
  const completed = progress.some((item) => item.lesson_id === lesson.id);
  const visibleOutlines = tree.outlines.filter((outline) => {
    const row = tree.lessons.find((item) => item.id === outline.id);
    return row?.publication_status === "published" || profile.role === "admin";
  });
  const ordered = orderLessons(visibleOutlines);
  const index = ordered.findIndex((item) => item.id === lesson.id);
  const previous = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;
  const groups = groupLessons(visibleOutlines);
  const completedIds = new Set(progress.map((item) => item.lesson_id));

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav aria-label="Lessons" className="hidden lg:block">
        <LessonList
          courseSlug={course.slug}
          groups={groups}
          currentId={lesson.id}
          completedIds={completedIds}
        />
      </nav>
      <article className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/learn/${course.slug}`} className="underline-offset-4 hover:underline">
              {course.title}
            </Link>
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-primary">{lesson.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {LESSON_TYPE_LABELS[lesson.lesson_type]}
            {lesson.estimated_minutes > 0 ? ` · ${lesson.estimated_minutes} min` : ""}
            {lesson.is_required ? " · Required" : " · Optional"}
            {completed ? " · Completed" : ""}
          </p>
        </div>
        <details className="rounded-xl border bg-white/80 p-4 lg:hidden">
          <summary className="cursor-pointer font-medium">Lessons</summary>
          <div className="mt-3">
            <LessonList
              courseSlug={course.slug}
              groups={groups}
              currentId={lesson.id}
              completedIds={completedIds}
            />
          </div>
        </details>
        <QueryBanner error={readQueryMessage(query.error)} notice={readQueryMessage(query.notice)} />
        <LessonVideo
          title={lesson.title}
          videoUrl={lesson.video_url}
          captionUrl={lesson.caption_url}
          lessonType={lesson.lesson_type}
        />
        <LessonBody body={lesson.body} />
        {lesson.transcript && (
          <details className="rounded-xl border bg-white/80 p-4">
            <summary className="cursor-pointer font-medium">Transcript</summary>
            <p className="mt-3 max-w-prose text-sm leading-6 whitespace-pre-wrap">{lesson.transcript}</p>
          </details>
        )}
        <section>
          <h2 className="font-display text-lg font-semibold">Downloads</h2>
          {resources.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No downloads for this lesson.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {resources.map((resource) => {
                const href = safeHttpsUrl(resource.external_url);
                return (
                  <li key={resource.id}>
                    {href ? (
                      <a
                        href={href}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resource.title}
                      </a>
                    ) : (
                      <span>{resource.title}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <div className="flex flex-wrap items-center gap-3">
          {previous ? (
            <Link
              href={`/learn/${course.slug}/lessons/${previous.slug}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          {enrolment && lesson.publication_status === "published" ? (
            completed ? (
              <p className="text-sm font-medium text-primary">Completed</p>
            ) : (
              <form action={completeLesson}>
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input type="hidden" name="courseSlug" value={course.slug} />
                <input type="hidden" name="lessonSlug" value={lesson.slug} />
                <button type="submit" className={cn(buttonVariants())}>
                  Mark as complete
                </button>
              </form>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Enrol to save your progress.</p>
          )}
          {next && (
            <Link
              href={`/learn/${course.slug}/lessons/${next.slug}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Next lesson
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}

function LessonList({
  courseSlug,
  groups,
  currentId,
  completedIds,
}: {
  courseSlug: string;
  groups: ReturnType<typeof groupLessons>;
  currentId: string;
  completedIds: Set<string>;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.title}
          </p>
          <ul className="mt-2 space-y-1">
            {group.lessons.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/learn/${courseSlug}/lessons/${item.slug}`}
                  aria-current={item.id === currentId ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-2 py-1.5 text-sm focus-visible:ring-3 focus-visible:ring-ring/50",
                    item.id === currentId ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  {item.title}
                  {completedIds.has(item.id) ? " · Done" : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
