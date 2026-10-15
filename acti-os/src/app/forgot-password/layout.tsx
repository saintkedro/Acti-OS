import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Reset password",
  description: "Request a link to choose a new ACTI OS password.",
  path: "/forgot-password",
  index: false,
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
