import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sign in",
  description:
    "Sign in to ACTI OS to continue your application, track admissions status, or access your student portal.",
  path: "/login",
  index: false,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
