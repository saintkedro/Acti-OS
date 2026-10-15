import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { QueryBanner } from "@/components/courses/query-banner";
import { CourseCertificateDocument } from "@/components/courses/course-certificate";
import { LessonVideo } from "@/components/courses/lesson-content";
import { buttonVariants } from "@/components/ui/button";
import { enrolInFreeCourse } from "@/lib/courses/actions";
import {
  COURSE_PILLAR_LABELS,
  DELIVERY_LABELS,
  LESSON_TYPE_LABELS,
  priceLabel,
} from "@/lib/courses/labels";
import { readQueryMessage } from "@/lib/courses/form";
import { groupLessons } from "@/lib/courses/progress";
import { getCourseBySlug, getEnrolment, getPublishedOutlines } from "@/lib/courses/queries";
import { getCurrentProfile } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { safeHttpsUrl } from "@/lib/courses/video";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { course } = await getCourseBySlug(slug);
  if (!course || course.publication_status !== "published") {
    return pageMetadata({
      title: "Short course",
      description: "ACTI short course.",
      path: `/short-courses/${slug}`,
      index: false,
    });
  }
  return pageMetadata({
    title: course.title,
    description: course.summary,
    path: `/short-courses/${course.slug}`,
  });
}

export default async function ShortCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const { course } = await getCourseBySlug(slug);
  if (!course || course.publication_status !== "published") notFound();

  const [{ lessons, assessments }, profile] = await Promise.all([
    getPublishedOutlines(course.id),
    getCurrentProfile(),
  ]);
  const enrolment = profile ? await getEnrolment(profile.id, course.id) : null;
  const groups = groupLessons(lessons);
  const outcomes = course.outcomes ?? [];
  const cover = safeHttpsUrl(course.cover_image_url);
  const loginNext = `/short-courses/${course.slug}`;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow={COURSE_PILLAR_LABELS[course.pillar]}
        title={course.title}
        description={course.summary}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Short courses", href: "/short-courses" },
          { label: course.title },
        ]}
      />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          <QueryBanner
            error={readQueryMessage(query.error)}
            notice={readQueryMessage(query.notice)}
          />
          {cover && (
            <div
              aria-hidden
              className="aspect-[16/7] w-full rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: `url("${cover.replace(/"/g, "")}")` }}
            />
          )}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-primary">Overview</h2>
            <div className="max-w-prose space-y-4 text-base leading-7">
              {course.description.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="whitespace-pre-wrap">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
            {course.certificate_enabled && (
              <div className="space-y-3 pt-4">
                <h3 className="font-display text-lg font-semibold text-primary">Certificate</h3>
                <p className="max-w-prose text-sm leading-6 text-muted-foreground">
                  This is a sample. Your own certificate is issued after you complete the required lessons and pass the check.
                </p>
                <CourseCertificateDocument
                  sample
                  learnerName="Ada Okon"
                  courseTitle={course.title}
                  issuedOn="the day you finish"
                  code="SAMPLE"
                  durationLabel={course.duration_label}
                  heading="p"
                />
              </div>
            )}
          </section>
          {outcomes.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-primary">
                Learning outcomes
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                {outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </section>
          )}
          <section className="grid gap-4 sm:grid-cols-2">
            <Info title="Who it is for" body={course.audience} />
            <Info title="Prerequisites" body={course.prerequisites} />
            <Info title="Instructor" body={course.instructor_name} detail={course.instructor_bio} />
            <Info
              title="Delivery"
              body={`${DELIVERY_LABELS[course.delivery_format]}. Practical sessions appear in My learning when this course schedules them.`}
            />
          </section>
          {course.intro_video_url && (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-primary">Introduction</h2>
              <LessonVideo
                title={`${course.title} introduction`}
                videoUrl={course.intro_video_url}
                captionUrl={null}
                lessonType="video"
              />
            </section>
          )}
          <section>
            <h2 className="font-display text-2xl font-semibold text-primary">Curriculum</h2>
            {groups.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Lessons will appear here when they are published.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {groups.map((group) => (
                  <li key={group.id} className="rounded-xl border bg-white p-4">
                    <h3 className="font-display font-semibold">{group.title}</h3>
                    <ol className="mt-3 space-y-3">
                      {group.lessons.map((lesson, index) => (
                        <li key={lesson.id} className="text-sm">
                          <p className="font-medium">
                            {index + 1}. {lesson.title}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {LESSON_TYPE_LABELS[lesson.lesson_type]}
                            {lesson.estimated_minutes > 0
                              ? ` · ${lesson.estimated_minutes} min`
                              : ""}
                            {lesson.is_required ? " · Required" : " · Optional"}
                          </p>
                          {lesson.summary && (
                            <p className="mt-1 leading-6 text-muted-foreground">{lesson.summary}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            )}
            {assessments.length > 0 && (
              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-display font-semibold">Checks</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {assessments.map((assessment) => (
                    <li key={assessment.id}>
                      <span className="font-medium">{assessment.title}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · Pass mark {assessment.pass_mark_percent}% ·{" "}
                        {assessment.attempt_limit} attempts
                        {assessment.is_required ? " · Required" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border bg-white p-5 lg:sticky lg:top-28">
          <p className="font-display text-3xl font-bold text-primary">{priceLabel(course)}</p>
          <p className="text-sm text-muted-foreground">{course.code}</p>
          {course.duration_label && (
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Clock3 className="size-3.5" />
              {course.duration_label}
            </p>
          )}
          {course.coming_soon ? (
            <p className="text-sm leading-6">
              This course is visible as a preview. Enrolment is not open yet.
            </p>
          ) : enrolment ? (
            <Link
              href={`/learn/${course.slug}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Continue learning
            </Link>
          ) : course.is_free ? (
            profile ? (
              <form action={enrolInFreeCourse}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="slug" value={course.slug} />
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full bg-highlight text-highlight-foreground hover:bg-highlight/90",
                  )}
                >
                  Enrol for free
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-6">Sign in or create an account to enrol.</p>
                <Link
                  href={`/login?next=${encodeURIComponent(loginNext)}`}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full bg-highlight text-highlight-foreground hover:bg-highlight/90",
                  )}
                >
                  Sign in to enrol
                </Link>
                <Link
                  href={`/signup?next=${encodeURIComponent(loginNext)}`}
                  className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full")}
                >
                  Create an account
                </Link>
              </div>
            )
          ) : (
            <p className="text-sm leading-6">
              Paid enrolment is not open yet. You can read this page, and access starts only after a confirmed payment.
            </p>
          )}
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}

function Info({ title, body, detail }: { title: string; body: string; detail?: string }) {
  if (!body && !detail) return null;
  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
      {body && <p className="mt-2 text-sm leading-6">{body}</p>}
      {detail && <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>}
    </div>
  );
}
