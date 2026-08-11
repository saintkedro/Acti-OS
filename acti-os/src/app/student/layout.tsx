import { requireProfile } from "@/lib/auth";
import { PortalShell } from "@/components/portal/portal-shell";

const nav = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/library", label: "E-Library" },
  { href: "/student/payments", label: "Payments" },
  { href: "/student/notifications", label: "Notifications" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile(["student", "admin"]);
  return (
    <PortalShell profile={profile} nav={nav}>
      {children}
    </PortalShell>
  );
}
