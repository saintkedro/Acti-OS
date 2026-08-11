import { requireProfile } from "@/lib/auth";
import { PortalShell } from "@/components/portal/portal-shell";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/programmes", label: "Programmes" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/notifications", label: "Notifications" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile(["admin"]);
  return (
    <PortalShell profile={profile} nav={nav}>
      {children}
    </PortalShell>
  );
}
