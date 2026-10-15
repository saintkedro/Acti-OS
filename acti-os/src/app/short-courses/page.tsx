import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { CourseCatalogue } from "@/components/courses/course-catalogue";
import { QueryBanner } from "@/components/courses/query-banner";
import { getPublishedCourses } from "@/lib/courses/queries";
import { readQueryMessage } from "@/lib/courses/form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Short courses",
  description:
    "ACTI short courses across technology, technical skills, and entrepreneurship. Browse free and paid pathways, then enrol online.",
  path: "/short-courses",
});

export default async function ShortCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  let courses: Awaited<ReturnType<typeof getPublishedCourses>>["courses"] = [];
  let unavailable = false;

  try {
    const result = await getPublishedCourses();
    courses = result.courses;
    unavailable = Boolean(result.error);
  } catch {
    unavailable = true;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow="Learning"
        title="Short courses"
        description="Practical online courses from ACTI. Start with a free introduction or browse what is open for enrolment."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Short courses" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <QueryBanner error={readQueryMessage(params.error)} />
        {unavailable ? (
          <p className="rounded-xl border bg-white px-4 py-8 text-sm leading-6 text-muted-foreground">
            The short-course catalogue is not available yet. Apply the latest database migration, then reload this page.
          </p>
        ) : courses.length === 0 ? (
          <p className="rounded-xl border bg-white px-4 py-8 text-sm text-muted-foreground">
            No short courses are open for enrolment yet.
          </p>
        ) : (
          <CourseCatalogue courses={courses} />
        )}
        <p className="mt-10 text-sm text-muted-foreground">
          Already enrolled?{" "}
          <Link href="/learn" className="font-medium text-primary underline-offset-4 hover:underline">
            Go to My learning
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
