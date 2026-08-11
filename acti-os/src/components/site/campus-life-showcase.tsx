"use client";

import { useState } from "react";
import {
  BriefcaseBusiness,
  Cpu,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: {
  id: string;
  label: string;
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    id: "learners",
    label: "Learners",
    title: "Digital classrooms",
    body: "Students building software, data, and ICT skills through guided, practical learning.",
    icon: Cpu,
  },
  {
    id: "technicians",
    label: "Technicians",
    title: "Hands-on workshops",
    body: "Applied training for engineering, repairs, electrical systems, and technical trades.",
    icon: Wrench,
  },
  {
    id: "teams",
    label: "Teams",
    title: "Project collaboration",
    body: "Learn, build, and innovate together through real projects and teamwork.",
    icon: Users,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    title: "Innovation & startups",
    body: "Entrepreneurship pathways that turn ideas into ventures and local jobs.",
    icon: BriefcaseBusiness,
  },
];

export function CampusLifeShowcase() {
  const [active, setActive] = useState(0);
  const item = TABS[active];
  const Icon = item.icon;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Campus life
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Built around practice
        </h2>
        <p className="mt-4 text-muted-foreground">
          Switch between pathways to see how ACTI trains learners, technicians,
          teams, and founders.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                active === index
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary via-brand-blue to-primary p-8 text-primary-foreground shadow-xl sm:p-10">
        <div
          aria-hidden
          className="animate-edu-float absolute -right-8 -top-8 size-40 rounded-full bg-highlight/30 blur-2xl"
        />
        <div className="relative">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 text-highlight backdrop-blur">
            <Icon className="size-8" strokeWidth={1.75} />
          </div>
          <h3 className="mt-6 font-display text-2xl font-bold">{item.title}</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            {item.body}
          </p>
          <div className="mt-8 flex gap-2">
            {TABS.map((_, index) => (
              <button
                key={TABS[index].id}
                type="button"
                aria-label={`Show ${TABS[index].label}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  active === index ? "w-8 bg-highlight" : "w-3 bg-white/35",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
