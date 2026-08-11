"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getLibraryResources,
  LIBRARY_TYPE_LABELS,
  type LibraryResourceType,
} from "@/lib/content/library-resources";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { BookMarked, ExternalLink, Filter } from "lucide-react";

const FILTERS: { id: "all" | LibraryResourceType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "guide", label: "Guides" },
  { id: "handout", label: "Handouts" },
  { id: "ebook", label: "E-books" },
  { id: "link", label: "Links" },
];

export function LibraryExplorer() {
  const resources = useMemo(() => getLibraryResources(), []);
  const [filter, setFilter] = useState<"all" | LibraryResourceType>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    return resources.filter((item) => {
      const matchesType = filter === "all" || item.type === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [filter, query, resources]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition",
                filter === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search library</span>
          <Filter className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="h-9 w-full rounded-lg border border-input bg-white pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {visible.length} resource{visible.length === 1 ? "" : "s"}
      </p>

      <ul className="grid gap-4 md:grid-cols-2">
        {visible.map((item) => {
          const external = item.url.startsWith("http");
          return (
            <li
              key={item.id}
              className="flex flex-col rounded-2xl border border-border/80 bg-white p-5 shadow-sm transition hover:border-brand-blue/25 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md bg-brand-teal/15 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
                  {LIBRARY_TYPE_LABELS[item.type]}
                </span>
                <span className="text-xs text-muted-foreground">{item.format}</span>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold text-primary">
                {item.title}
              </h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {item.category}
              </p>
              <Link
                href={item.url}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "mt-4 w-fit",
                )}
              >
                {external ? (
                  <>
                    Open link
                    <ExternalLink className="size-3.5" />
                  </>
                ) : (
                  <>
                    Open resource
                    <BookMarked className="size-3.5" />
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {!visible.length && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No resources match your filters.
        </p>
      )}
    </div>
  );
}
