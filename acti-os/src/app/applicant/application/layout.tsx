import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Application",
  description:
    "Complete your ACTI online application — personal details, academics, programme choice, and document uploads.",
  path: "/applicant/application",
  index: false,
});

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
