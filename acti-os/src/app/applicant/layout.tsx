import { requireProfile } from "@/lib/auth";
import { PortalShell } from "@/components/portal/portal-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Applicant portal",
  description:
    "ACTI OS applicant portal — manage your application, documents, payments, and notifications.",
  path: "/applicant",
  index: false,
});

const nav = [
  { href: "/applicant", label: "Dashboard" },
  { href: "/applicant/application", label: "Application" },
  { href: "/applicant/payments", label: "Payments" },
  { href: "/applicant/notifications", label: "Notifications" },
];

export default async function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile(["applicant", "student", "admin"]);
  return (
    <PortalShell profile={profile} nav={nav}>
      {children}
    </PortalShell>
  );
}
