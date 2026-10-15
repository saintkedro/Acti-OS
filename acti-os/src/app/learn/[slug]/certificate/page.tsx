import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCertificateDocument } from "@/components/courses/course-certificate";
import { PrintCertificateButton } from "@/components/courses/print-certificate-button";
import { buttonVariants } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";
import { completionSummary } from "@/lib/courses/progress";
import {
  getAttempts,
  getCourseBySlug,
  getEnrolment,
  getLessonProgress,
  getPublishedOutlines,
  getReadableCourseTree,
  issueCourseCertificate,
} from "@/lib/courses/queries";
import type { LessonOutline } from "@/lib/courses/types";
import { cn } from "@/lib/utils";

function certificateProblem(message: string | null) {
  if (!message) return null;
  if (/could not find the function|schema cache|does not exist/i.test(message)) return "migration";
  if (/not met/i.test(message)) return "incomplete";
  return "unavailable";
}

export default async function CourseCertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await requireProfile();
  const { course } = await getCourseBySlug(slug);
  if (!course) notFound();
  if (course.publication_status !== "published" && profile.role !== "admin") notFound();

  const enrolment = await getEnrolment(profile.id, course.id);
  if (!enrolment || enrolment.status === "withdrawn") notFound();

  const tree = await getReadableCourseTree(course.id);
  const published = await getPublishedOutlines(course.id);
  const outlines: LessonOutline[] = tree.outlines.filter((outline) => {
    const lesson = tree.lessons.find((item) => item.id === outline.id);
    return lesson?.publication_status === "published";
  });
  const progress = await getLessonProgress(enrolment.id);
  const attempts = await getAttempts(enrolment.id);
  const summary = completionSummary(
    outlines,
    published.assessments,
    new Set(progress.map((item) => item.lesson_id)),
    new Set(attempts.filter((item) => item.passed).map((item) => item.assessment_id)),
  );

  if (!course.certificate_enabled) {
    return (
      <CertificateNote
        slug={course.slug}
        title="This course does not include a certificate."
        body="Completion is still recorded in My learning."
      />
    );
  }

  if (!summary.complete) {
    return (
      <CertificateNote
        slug={course.slug}
        title="Your certificate is not ready yet."
        body="Finish every required lesson and pass the course check. The certificate is issued only after those requirements are met."
      />
    );
  }

  const issued = await issueCourseCertificate(enrolment.id);
  const problem = certificateProblem(issued.error);

  if (!issued.certificate) {
    if (problem === "migration") {
      return (
        <CertificateNote
          slug={course.slug}
          title="Certificates are not available yet."
          body="Apply the latest database migration, then open this page again."
        />
      );
    }
    if (problem === "incomplete") {
      return (
        <CertificateNote
          slug={course.slug}
          title="Your certificate is not ready yet."
          body="Finish every required lesson and pass the course check. The certificate is issued only after those requirements are met."
        />
      );
    }
    return (
      <CertificateNote
        slug={course.slug}
        title="Your certificate could not be prepared."
        body="Try again in a moment. If this keeps happening, the course record may still be updating."
      />
    );
  }

  const certificate = issued.certificate;
  const issuedOn = new Date(certificate.issued_at).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/learn/${course.slug}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to course
        </Link>
        <PrintCertificateButton />
      </div>
      <CourseCertificateDocument
        learnerName={certificate.learner_name}
        courseTitle={certificate.course_title}
        issuedOn={issuedOn}
        code={certificate.code}
        durationLabel={course.duration_label}
        heading="h1"
      />
    </div>
  );
}

function CertificateNote({
  slug,
  title,
  body,
}: {
  slug: string;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-4 rounded-xl border bg-white/80 p-6">
      <h1 className="font-display text-2xl font-bold text-primary">{title}</h1>
      <p className="max-w-prose text-sm leading-6 text-muted-foreground">{body}</p>
      <Link href={`/learn/${slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
        Back to course
      </Link>
    </div>
  );
}
