import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { IconFeatureCard } from "@/components/site/icon-feature-card";
import {
  InnovateIllustration,
  LearnIllustration,
} from "@/components/site/illustrations";
import { buttonVariants } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Cpu, Lightbulb, Wrench } from "lucide-react";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow="About ACTI"
        title={INSTITUTION.name}
        description="A next-generation institution developing highly skilled, innovative, and industry-ready graduates."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <div>
              <h2 className="font-display text-2xl font-bold text-primary">
                Who we are
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Amana College of Technology and Innovation (ACTI) is dedicated to
                developing highly skilled, innovative, and industry-ready
                graduates through technology-driven education, technical and
                vocational training, and entrepreneurship.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Established by {INSTITUTION.founder}, ACTI is designed to become
                a leading centre for applied learning, digital transformation,
                technical education, and workforce development in Akwa Ibom State
                and beyond.
              </p>
            </div>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary via-white to-brand-teal/20 p-6 shadow-sm">
              <LearnIllustration />
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <Reveal>
            <IconFeatureCard
              icon={Cpu}
              title="Technology learners"
              body="Software, AI, cybersecurity, and digital systems."
            />
          </Reveal>
          <Reveal delayMs={80}>
            <IconFeatureCard
              icon={Wrench}
              title="Technicians in training"
              body="Hands-on electrical, engineering, and maintenance skills."
            />
          </Reveal>
          <Reveal delayMs={160}>
            <IconFeatureCard
              icon={Lightbulb}
              title="Innovators & founders"
              body="Enterprise pathways that create jobs and ventures."
            />
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-primary">Vision</h2>
              <p className="mt-3 text-muted-foreground">{INSTITUTION.vision}</p>
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-primary">Mission</h2>
              <p className="mt-3 text-muted-foreground">{INSTITUTION.mission}</p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <h2 className="mt-16 font-display text-2xl font-bold text-primary">
            Core values
          </h2>
        </Reveal>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INSTITUTION.values.map((value, i) => (
            <Reveal key={value.title} delayMs={i * 50}>
              <li className="h-full rounded-2xl border border-border/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
                <h3 className="font-display text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <div className="mt-16 overflow-hidden rounded-3xl border border-primary/10 bg-secondary/50">
            <div className="grid items-center gap-6 p-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                  Academic philosophy
                </h2>
                <p className="mt-3 max-w-3xl text-muted-foreground">
                  ACTI adopts a learn, build, and innovate approach, where
                  students acquire knowledge, develop practical competence, and
                  create real solutions through projects, industry engagement,
                  internships, and entrepreneurship.
                </p>
                <Link
                  href="/admissions"
                  className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}
                >
                  Begin admissions
                </Link>
              </div>
              <InnovateIllustration className="max-w-xs justify-self-center" />
            </div>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
