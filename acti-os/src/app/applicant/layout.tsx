import { requireProfile } from "@/lib/auth";
import { PortalShell } from "@/components/portal/portal-shell";

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
