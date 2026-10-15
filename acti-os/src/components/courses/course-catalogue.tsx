"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Search } from "lucide-react";
import {
  COURSE_PILLAR_LABELS,
  DELIVERY_LABELS,
  priceLabel,
} from "@/lib/courses/labels";
import type { CourseCardData } from "@/lib/courses/types";
import type { ProgrammePillar } from "@/lib/types";
import { cn } from "@/lib/utils";
import { safeHttpsUrl } from "@/lib/courses/video";

const PILLARS: { id: "all" | ProgrammePillar; label: string }[] = [
  { id: "all", label: "All pillars" },
  { id: "technology", label: COURSE_PILLAR_LABELS.technology },
  { id: "technical_vocational", label: COURSE_PILLAR_LABELS.technical_vocational },
  { id: "innovation_entrepreneurship", label: COURSE_PILLAR_LABELS.innovation_entrepreneurship },
];

export function CourseCatalogue({ courses }: { courses: CourseCardData[] }) {
  const [query, setQuery] = useState("");
  const [pillar, setPillar] = useState<"all" | ProgrammePillar>("all");
  const [fee, setFee] = useState<"all" | "free" | "paid">("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (pillar !== "all" && course.pillar !== pillar) return false;
      if (fee === "free" && !course.is_free) return false;
      if (fee === "paid" && course.is_free) return false;
      if (!needle) return true;
      const haystack = `${course.title} ${course.summary} ${course.keywords} ${course.code}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [courses, fee, pillar, query]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="course-search" className="sr-only">
            Search by course title or keyword
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="course-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or keyword"
            className="h-11 w-full rounded-xl border border-border bg-white pr-3 pl-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPillar(item.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition focus-visible:ring-3 focus-visible:ring-ring/50",
                pillar === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Fee">
          {(
            [
              ["all", "All fees"],
              ["free", "Free"],
              ["paid", "Paid"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFee(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50",
                fee === id
                  ? "bg-brand-teal text-white"
                  : "bg-white text-foreground ring-1 ring-border hover:bg-secondary",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Showing {visible.length} course{visible.length === 1 ? "" : "s"}.
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-xl border bg-white px-4 py-8 text-sm text-muted-foreground">
          No courses match that search. Try another pillar or clear the fee filter.
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {visible.map((course) => {
            const cover = safeHttpsUrl(course.cover_image_url);
            return (
              <li key={course.id}>
                <Link
                  href={`/short-courses/${course.slug}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm transition hover:border-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {cover ? (
                    <div
                      aria-hidden
                      className="aspect-[16/8] w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${cover.replace(/"/g, "")}")` }}
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="flex aspect-[16/8] items-end bg-[linear-gradient(135deg,#0B1F3A,#1E3A8A_60%,#0EA5A4)] p-4"
                    >
                      <span className="text-xs font-semibold tracking-wide text-white/90">
                        {course.code}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{COURSE_PILLAR_LABELS[course.pillar]}</span>
                      <span aria-hidden>·</span>
                      <span>{DELIVERY_LABELS[course.delivery_format]}</span>
                    </div>
                    <h2 className="mt-2 font-display text-xl font-semibold text-primary">
                      {course.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {course.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      {course.duration_label && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Clock3 className="size-3.5" />
                          {course.duration_label}
                        </span>
                      )}
                      <span className="font-semibold text-primary">{priceLabel(course)}</span>
                      {course.coming_soon && (
                        <span className="rounded-full bg-highlight/20 px-2 py-0.5 text-xs font-medium text-highlight-foreground">
                          Coming soon
                        </span>
                      )}
                      {!course.coming_soon && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          Open
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
