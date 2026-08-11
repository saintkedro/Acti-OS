import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { InnovateIllustration } from "@/components/site/illustrations";
import { buttonVariants } from "@/components/ui/button";
import { INSTITUTION } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Building2, Landmark, LogIn } from "lucide-react";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        title="Contact"
        description="Visit our campus in Oron or continue your application in the ACTI OS portal."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <Reveal>
          <div className="mb-10 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary via-brand-blue to-primary p-8 text-primary-foreground sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-highlight">
                  Visit or apply
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  Meet us in Oron — or start online today.
                </h2>
              </div>
              <InnovateIllustration className="max-w-xs justify-self-center opacity-95" />
            </div>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Building2,
              title: "Campus",
              body: INSTITUTION.address,
            },
            {
              icon: Landmark,
              title: "Founder",
              body: INSTITUTION.founder,
            },
            {
              icon: LogIn,
              title: "Admissions portal",
              body: "For application status and fee payments, sign in to ACTI OS.",
              action: true,
            },
          ].map((item, i) => (
            <Reveal key={item.title} delayMs={i * 80}>
              <div className="h-full rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-teal/15 text-brand-teal">
                  <item.icon className="size-6" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
                {item.action && (
                  <Link
                    href="/login"
                    className={cn(buttonVariants({ size: "sm" }), "mt-4")}
                  >
                    Portal login
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Prefer to start online?
            </h2>
            <p className="mt-3 max-w-xl text-white/80">
              Create your ACTI OS account and submit your application from
              anywhere.
            </p>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 bg-highlight text-highlight-foreground hover:bg-highlight/90",
              )}
            >
              Apply now
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
