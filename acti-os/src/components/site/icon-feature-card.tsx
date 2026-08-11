import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconFeatureCard({
  icon: Icon,
  title,
  body,
  href,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href?: string;
  className?: string;
}) {
  const inner = (
    <>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-teal/15 text-brand-teal transition duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:scale-105">
        <Icon className="size-7" strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      {href && (
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Explore
          <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
        </span>
      )}
    </>
  );

  const classes = cn(
    "group flex h-full flex-col rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
