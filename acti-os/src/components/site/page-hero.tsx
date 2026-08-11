import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-primary pt-28 text-primary-foreground sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(245, 158, 11, 0.35), transparent 40%), linear-gradient(135deg, #0B1F3A, #1E3A8A 55%, #0B1F3A)",
        }}
      />
      <div
        aria-hidden
        className="animate-edu-float pointer-events-none absolute -right-16 top-10 size-56 rounded-full bg-highlight/25 blur-2xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16">
        {crumbs && (
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {c.href ? (
                  <Link href={c.href} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-highlight">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "animate-edu-rise mt-2 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="animate-edu-rise mt-4 max-w-2xl text-base text-white/80 [animation-delay:120ms] sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
