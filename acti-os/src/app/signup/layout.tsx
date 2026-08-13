import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Create account",
  description:
    "Create your ACTI OS account to start an online application to Amana College of Technology and Innovation.",
  path: "/signup",
  index: true,
});

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
