import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Student notifications",
  description: "Campus and account notifications for ACTI students.",
  path: "/student/notifications",
  index: false,
});

export default function StudentNotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
