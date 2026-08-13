import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Admin notifications",
  description: "System notifications for ACTI administrators.",
  path: "/admin/notifications",
  index: false,
});

export default function AdminNotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
