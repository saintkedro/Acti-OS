"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PILLAR_LABELS, type ProgrammePillar } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock3 } from "lucide-react";

type ProgrammeItem = {
  code: string;
  name: string;
  pillar: ProgrammePillar;
  description: string;
  duration: string | null;
};

const FILTERS: { id: "all" | ProgrammePillar; label: string }[] = [
  { id: "all", label: "All" },
  { id: "technology", label: "Technology & Digital" },
  { id: "technical_vocational", label: "Technical & Vocational" },
  { id: "innovation_entrepreneurship", label: "Innovation & Entrepreneurship" },
];

export function ProgrammeExplorer({
  programmes,
}: {
  programmes: ProgrammeItem[];
}) {
  const [filter, setFilter] = useState<"all" | ProgrammePillar>("all");

  const visible = useMemo(() => {
    if (filter === "all") return programmes;
    return programmes.filter((p) => p.pillar === filter);
  }, [filter, programmes]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              filter === item.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Showing {visible.length} programme{visible.length === 1 ? "" : "s"}
        {filter !== "all" ? ` in ${PILLAR_LABELS[filter]}` : ""}.
      </p>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2">
        {visible.map((programme, index) => (
          <li
            key={programme.code}
            className="group flex flex-col rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {programme.code}
              </span>
              {programme.duration && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  {programme.duration}
                </span>
              )}
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {PILLAR_LABELS[programme.pillar]}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold group-hover:text-primary">
              {programme.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {programme.description}
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Apply
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
