import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { verifyCourseCertificate } from "@/lib/courses/queries";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Verify a certificate",
  description: "Confirm an ACTI short-course certificate of completion.",
  path: "/verify",
  index: false,
});

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).trim();
  const sample = code.toUpperCase() === "SAMPLE";
  const result = sample ? { certificate: null, error: null } : await verifyCourseCertificate(code);
  const missingFunction = /could not find the function|schema cache|does not exist/i.test(result.error ?? "");
  const certificate = result.certificate;
  const issuedOn = certificate
    ? new Date(certificate.issued_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Lagos",
      })
    : "";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow="Short courses"
        title="Verify a certificate"
        description="Confirm that an ACTI certificate of completion was issued for a short course."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Short courses", href: "/short-courses" },
          { label: "Verify" },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        {missingFunction ? (
          <Panel
            title="Verification is not available yet."
            body="Apply the latest database migration, then open this link again."
          />
        ) : certificate ? (
          <section className="rounded-2xl border bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.16em] text-brand-teal uppercase">Confirmed</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-primary">{certificate.learner_name}</h2>
            <p className="mt-4 text-base leading-7">
              completed <span className="font-semibold">{certificate.course_title}</span> on {issuedOn}.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Certificate code {certificate.code}</p>
            <p className="mt-6 max-w-prose text-sm leading-6 text-muted-foreground">
              This confirms an ACTI certificate of completion for a short course. It is not a diploma and it is not an accredited qualification.
            </p>
          </section>
        ) : (
          <Panel
            title={sample ? "This sample cannot be confirmed." : "No certificate matches this code."}
            body={
              sample
                ? "SAMPLE is printed on the course overview so you can see the layout. It is not issued to a learner. An earned certificate has its own code and link."
                : "Check the code on the certificate and try again. Only a certificate issued after the course is completed can be confirmed."
            }
          />
        )}
        <Link href="/short-courses" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
          Browse short courses
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border bg-white p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold text-primary">{title}</h2>
      <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">{body}</p>
    </section>
  );
}
