import { LibraryExplorer } from "@/components/library/library-explorer";
import { pageMetadata } from "@/lib/seo";
import { BookOpen } from "lucide-react";

export const metadata = pageMetadata({
  title: "E-Library",
  description:
    "ACTI student E-Library — curated learning resources for enrolled students.",
  path: "/student/library",
  index: false,
});

export default function StudentLibraryPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-teal/15 text-brand-teal">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">
              E-Library
            </h1>
            <p className="mt-1 text-muted-foreground">
              Curated guides, handouts, and learning links for ACTI students.
            </p>
          </div>
        </div>
      </div>
      <LibraryExplorer />
    </div>
  );
}
