import { requireProfile } from "@/lib/auth";
import { PortalShell } from "@/components/portal/portal-shell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My learning",
  description: "Your ACTI short courses, progress, and course checks.",
  path: "/learn",
  index: false,
});

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const portal =
    profile.role === "admin"
      ? "/admin"
      : profile.role === "student"
        ? "/student"
        : "/applicant";

  const nav = [
    { href: "/learn", label: "My learning" },
    { href: "/short-courses", label: "Catalogue" },
    { href: portal, label: profile.role === "admin" ? "Admin" : "My portal" },
  ];

  return (
    <PortalShell profile={profile} nav={nav}>
      {children}
    </PortalShell>
  );
}
