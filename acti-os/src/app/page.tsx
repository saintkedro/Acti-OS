import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { Reveal } from "@/components/site/reveal";
import { IconFeatureCard } from "@/components/site/icon-feature-card";
import { CampusLifeShowcase } from "@/components/site/campus-life-showcase";
import {
  BuildIllustration,
  HeroIllustration,
  InnovateIllustration,
  LearnIllustration,
} from "@/components/site/illustrations";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { INSTITUTION } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Cpu,
  Lightbulb,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export const metadata = pageMetadata({
  title: `${INSTITUTION.shortName} — ${INSTITUTION.name}`,
  description: `${INSTITUTION.name} — ${INSTITUTION.tagline} Technology, technical & vocational, and entrepreneurship programmes in Oron, Akwa Ibom. Apply online via ACTI OS.`,
  path: "/",
  absoluteTitle: true,
});

const pillars = [
  {
    title: "Technology & Digital",
    body: "Software, AI, cybersecurity, data systems, and ICT skills for the digital workplace.",
    icon: Cpu,
    href: "/programmes",
  },
  {
    title: "Technical & Vocational",
    body: "Hands-on engineering, trades, renewable energy, and NSQ pathways.",
    icon: Wrench,
    href: "/programmes",
  },
  {
    title: "Innovation & Entrepreneurship",
    body: "Product design, digital entrepreneurship, and startup building that creates jobs.",
    icon: Lightbulb,
    href: "/programmes",
  },
];

const reasons = [
  {
    title: "Industry-ready learning",
    body: "Learn, build, and innovate through projects, labs, and real-world practice.",
    icon: BookOpen,
  },
  {
    title: "Digital campus (ACTI OS)",
    body: "Admissions, fees, records, and student services on one secure platform.",
    icon: ShieldCheck,
  },
  {
    title: "Proven ecosystem",
    body: "Built on the Edet Amana Foundation ICT Hub — NBTE skills centre & JAMB CBT in Oron.",
    icon: Building2,
  },
];

const stats = [
  { value: "3", label: "Academic pillars" },
  { value: "15+", label: "Programme pathways" },
  { value: "100%", label: "Online admissions" },
  { value: "1", label: "Unified campus OS" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="overlay" />

      <section className="relative min-h-[100svh] overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(30, 58, 138, 0.55), transparent 40%), radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.28), transparent 35%), linear-gradient(145deg, #0B1F3A, #1E3A8A 50%, #0B1F3A)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-4 pb-16 pt-36 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-28">
          <div>
            <p className="animate-edu-rise font-display text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              ACTI
            </p>
            <h1 className="animate-edu-rise mt-3 max-w-xl font-display text-2xl font-semibold leading-tight [animation-delay:100ms] sm:text-4xl">
              Technology Driven. Innovation Focused. Future Ready.
            </h1>
            <p className="animate-edu-rise mt-5 max-w-lg text-base text-white/85 [animation-delay:180ms] sm:text-lg">
              Amana College of Technology and Innovation — applied learning,
              technical skills, and entrepreneurship from admission to graduation.
            </p>
            <div className="animate-edu-rise mt-8 flex flex-wrap gap-3 [animation-delay:260ms]">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-highlight text-highlight-foreground hover:bg-highlight/90",
                )}
              >
                Start your application
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/programmes"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/50 bg-transparent text-white hover:bg-white/10",
                )}
              >
                Explore programmes
              </Link>
            </div>
          </div>
          <div className="animate-edu-rise hidden [animation-delay:200ms] lg:block">
            <HeroIllustration className="drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto grid max-w-6xl gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_40px_-12px_rgba(11,31,58,0.28)] sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-secondary/60 px-4 py-5 text-center transition hover:bg-secondary"
              >
                <p className="font-display text-3xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              What we teach
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Learn. Build. Innovate.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three integrated pillars — explore each pathway below.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delayMs={i * 90}>
              <IconFeatureCard {...pillar} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Reveal>
            <div className="rounded-2xl border bg-white p-4">
              <LearnIllustration />
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="rounded-2xl border bg-white p-4">
              <BuildIllustration />
            </div>
          </Reveal>
          <Reveal delayMs={160}>
            <div className="rounded-2xl border bg-white p-4">
              <InnovateIllustration />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/35 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <CampusLifeShowcase />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary via-white to-brand-teal/15 p-8">
              <BuildIllustration />
            </div>
          </Reveal>
          <Reveal delayMs={120}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Why ACTI
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                A college built for the future of work
              </h2>
              <div className="mt-8 space-y-4">
                {reasons.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-transparent bg-white p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal/15 text-brand-teal">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
        <div
          aria-hidden
          className="animate-edu-float absolute -left-16 top-0 size-64 rounded-full bg-highlight/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
              Built on a proven educational ecosystem
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
              ACTI benefits from the {INSTITUTION.founder} ICT Hub — an
              NBTE-accredited skill acquisition centre and the only JAMB-approved
              CBT Centre in Oron, Akwa Ibom State.
            </p>
            <Link
              href="/about"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 bg-highlight text-highlight-foreground hover:bg-highlight/90",
              )}
            >
              About the college
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-teal">
                  Academic Resources
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                  Guides for applicants and learners
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Read admissions tips, programme pathways, and campus updates —
                  then continue into the student E-Library after enrollment.
                </p>
              </div>
              <Link
                href="/resources"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                Browse resources
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-white via-secondary/50 to-highlight/15 px-6 py-12 sm:px-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
                  Ready to join ACTI?
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Create your account, complete your application online, and
                  track every step on ACTI OS.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    Apply now
                  </Link>
                  <Link
                    href="/admissions"
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                    )}
                  >
                    Admissions guide
                  </Link>
                </div>
              </div>
              <InnovateIllustration className="max-w-xs justify-self-center" />
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
