import Link from "next/link";
import { INSTITUTION } from "@/lib/types";
import { SITE_URL } from "@/lib/seo";

export function CourseCertificateDocument({
  learnerName,
  courseTitle,
  issuedOn,
  code,
  durationLabel,
  sample = false,
  heading = "h2",
}: {
  learnerName: string;
  courseTitle: string;
  issuedOn: string;
  code: string;
  durationLabel?: string;
  sample?: boolean;
  heading?: "h1" | "h2" | "p";
}) {
  const Title = heading;
  const verifyCode = sample ? "SAMPLE" : code;
  const verifyPath = `/verify/${encodeURIComponent(verifyCode)}`;
  const verifyUrl = `${SITE_URL}${verifyPath}`;

  return (
    <article
      aria-label={sample ? "Sample certificate of completion" : "Certificate of completion"}
      className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white text-foreground shadow-[0_20px_50px_-24px_rgba(11,31,58,0.45)] [print-color-adjust:exact] print:max-w-none print:rounded-none print:shadow-none"
    >
      <div className="bg-primary px-6 py-5 text-primary-foreground sm:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase">{INSTITUTION.shortName}</p>
            <p className="mt-1 text-sm leading-5 text-primary-foreground/80">{INSTITUTION.name}</p>
          </div>
          {sample && (
            <p className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase">
              Sample
            </p>
          )}
        </div>
      </div>
      <div className="bg-gradient-to-r from-primary via-brand-teal to-primary h-1.5" />
      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-sm font-medium tracking-[0.18em] text-brand-teal uppercase">Short course</p>
        <Title className="mt-2 font-display text-4xl font-bold tracking-tight text-primary">
          Certificate of completion
        </Title>
        <p className="mt-8 text-base text-muted-foreground">This certifies that</p>
        <p className="mt-1 border-b border-brand-teal/40 pb-2 font-display text-3xl font-semibold text-foreground">
          {learnerName}
        </p>
        <p className="mt-6 text-base text-muted-foreground">has completed</p>
        <p className="mt-1 font-display text-2xl font-semibold text-primary">{courseTitle}</p>

        <dl className="mt-8 grid gap-4 border-y border-border py-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Completed</dt>
            <dd className="mt-1 text-sm font-medium">{issuedOn}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Duration</dt>
            <dd className="mt-1 text-sm font-medium">{durationLabel || "Short course"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Certificate code</dt>
            <dd className="mt-1 text-sm font-medium">{code}</dd>
          </div>
        </dl>

        <p className="mt-6 max-w-prose text-sm leading-6 text-muted-foreground">
          This is an ACTI certificate of completion for a short course. It is not a diploma and it is not an accredited qualification.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <Signature role="Course lead" sample={sample} />
          <Signature role="Registrar" sample={sample} mark="second" />
        </div>

        <div className="mt-10 rounded-xl bg-secondary/70 px-4 py-3 text-sm leading-6">
          <p className="font-medium text-primary">Verify this certificate</p>
          <p className="mt-1 text-muted-foreground">
            {sample
              ? "A sample code cannot be confirmed. An issued certificate uses a unique link."
              : "Anyone can confirm this certificate with the code or the link below."}
          </p>
          <Link href={verifyPath} className="mt-2 inline-block font-medium break-all text-primary underline-offset-4 hover:underline">
            {verifyUrl}
          </Link>
        </div>
      </div>
    </article>
  );
}

function Signature({
  role,
  sample,
  mark = "first",
}: {
  role: string;
  sample: boolean;
  mark?: "first" | "second";
}) {
  return (
    <div>
      <svg viewBox="0 0 220 56" className="h-14 w-44 text-primary" aria-hidden>
        {mark === "first" ? (
          <path
            d="M8 36c18-22 28-8 36 2 8 10 6-24 22-20 14 4 8 28 24 16 10-8 18-2 28 4 12 8 22-6 40-2 10 2 16 10 28 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M12 32c16 10 20-20 34-14 12 6 4 22 18 18 16-4 10-24 28-16 8 4 14 14 24 10 14-6 22 8 40 4 12-2 20 6 32 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="mt-1 h-px w-44 bg-primary/30" />
      <p className="mt-2 text-sm font-medium text-foreground">{role}</p>
      <p className="text-xs text-muted-foreground">{sample ? "Sample signature" : INSTITUTION.shortName}</p>
    </div>
  );
}
