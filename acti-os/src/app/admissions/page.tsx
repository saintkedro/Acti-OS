import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { LearnIllustration } from "@/components/site/illustrations";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admissions" };

const steps = [
  {
    title: "Create your account",
    body: "Sign up for ACTI OS with your email and personal details.",
  },
  {
    title: "Complete your application",
    body: "Fill the multi-step form and upload required documents.",
  },
  {
    title: "Pay the application fee",
    body: "Transfer using your unique payment reference for easy confirmation.",
  },
  {
    title: "Track your status",
    body: "Follow review progress and decisions in your applicant portal.",
  },
  {
    title: "Accept your offer",
    body: "Pay the acceptance fee by bank transfer when you receive an offer.",
  },
  {
    title: "Become a student",
    body: "Receive your ACTI student ID and access the student portal.",
  },
];

export default function AdmissionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        title="Admissions"
        description="Apply online through ACTI OS — no paperwork queues. Track every step from application to enrollment."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admissions" },
        ]}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <Reveal>
          <div className="mb-12 grid items-center gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary via-white to-brand-teal/15 p-6">
              <LearnIllustration />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
                How to apply
              </h2>
              <p className="mt-3 text-muted-foreground">
                A clear path from discovery to enrollment — designed for
                learners ready to build practical careers.
              </p>
            </div>
          </div>
        </Reveal>

        <ol className="grid gap-5 md:grid-cols-2">
          {steps.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 60}>
              <li className="relative h-full overflow-hidden rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-md">
                <span className="font-display text-4xl font-bold text-primary/15">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <div className="mt-14 flex flex-wrap gap-3 rounded-3xl bg-secondary/50 p-8">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Create account & apply
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Continue an application
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
