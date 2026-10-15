import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QueryBanner } from "@/components/courses/query-banner";
import {
  COURSE_PILLAR_LABELS,
  COURSE_STATUS_LABELS,
  priceLabel,
} from "@/lib/courses/labels";
import { readQueryMessage } from "@/lib/courses/form";
import type { ShortCourse } from "@/lib/courses/types";
import { pageMetadata } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Short courses",
  description: "Create and publish ACTI short courses.",
  path: "/admin/courses",
  index: false,
});

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireProfile(["admin"]);
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("short_courses")
    .select("*")
    .order("title");

  const courses = (data ?? []) as ShortCourse[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Short courses</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Drafts stay off the public catalogue. Paid courses cannot be published until payment confirmation is connected.
          </p>
        </div>
        <Link href="/admin/courses/new" className={cn(buttonVariants())}>
          New course
        </Link>
      </div>
      <QueryBanner error={readQueryMessage(params.error)} notice={readQueryMessage(params.notice)} />
      {error && (
        <p className="text-sm text-muted-foreground">
          Short courses are not available yet. Apply the latest database migration.
        </p>
      )}
      {!error && courses.length === 0 && (
        <p className="text-sm text-muted-foreground">No short courses yet.</p>
      )}
      {courses.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white/80">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Pillar</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.code}</p>
                  </td>
                  <td className="px-4 py-3">{COURSE_PILLAR_LABELS[course.pillar]}</td>
                  <td className="px-4 py-3">{priceLabel(course)}</td>
                  <td className="px-4 py-3">{COURSE_STATUS_LABELS[course.publication_status]}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/courses/${course.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
