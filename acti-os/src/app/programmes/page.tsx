import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { ProgrammeExplorer } from "@/components/site/programme-explorer";
import { IconFeatureCard } from "@/components/site/icon-feature-card";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Programme, ProgrammePillar } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, Cpu, Wrench } from "lucide-react";

export const metadata = { title: "Programmes" };

const FALLBACK: Pick<
  Programme,
  "code" | "name" | "pillar" | "description" | "duration"
>[] = [
  {
    code: "SDV",
    name: "Software Development",
    pillar: "technology",
    description:
      "Build modern software applications with industry-relevant tools and practices.",
    duration: "1–2 years",
  },
  {
    code: "CYB",
    name: "Cybersecurity",
    pillar: "technology",
    description: "Protect systems, networks, and data against modern threats.",
    duration: "1–2 years",
  },
  {
    code: "CRM",
    name: "Computer Repairs and Maintenance",
    pillar: "technical_vocational",
    description:
      "Diagnose, repair, and maintain computer hardware and systems.",
    duration: "6–12 months",
  },
  {
    code: "DEN",
    name: "Digital Entrepreneurship",
    pillar: "innovation_entrepreneurship",
    description: "Launch and scale digital ventures.",
    duration: "6–12 months",
  },
];

export default async function ProgrammesPage() {
  let programmes = FALLBACK;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("programmes")
      .select("code, name, pillar, description, duration")
      .eq("is_active", true)
      .order("name");
    if (data?.length) programmes = data;
  } catch {
    // Supabase may be unconfigured during local UI preview.
  }

  const explorerData = programmes.map((p) => ({
    code: p.code,
    name: p.name,
    pillar: p.pillar as ProgrammePillar,
    description: p.description,
    duration: p.duration,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        title="Programmes"
        description="Filter by pathway and explore technology, technical & vocational, and innovation programmes."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Programmes" },
        ]}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          <Reveal>
            <IconFeatureCard
              icon={Cpu}
              title="Technology & Digital"
              body="Software, AI, cybersecurity, data, and ICT pathways."
            />
          </Reveal>
          <Reveal delayMs={80}>
            <IconFeatureCard
              icon={Wrench}
              title="Technical & Vocational"
              body="Engineering diplomas, repairs, electrical, and NSQ skills."
            />
          </Reveal>
          <Reveal delayMs={160}>
            <IconFeatureCard
              icon={BriefcaseBusiness}
              title="Innovation & Entrepreneurship"
              body="Innovation, product design, and startup development."
            />
          </Reveal>
        </div>

        <Reveal>
          <ProgrammeExplorer programmes={explorerData} />
        </Reveal>

        <Reveal>
          <div className="mt-16 overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Find your pathway at ACTI
            </h2>
            <p className="mt-3 max-w-xl text-white/80">
              Start your online application and select your preferred programme
              in ACTI OS.
            </p>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 bg-highlight text-highlight-foreground hover:bg-highlight/90",
              )}
            >
              Apply to a programme
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
