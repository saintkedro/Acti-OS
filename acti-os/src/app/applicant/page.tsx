import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from "@/lib/types";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Applicant dashboard",
  description:
    "Track your ACTI application from draft to enrollment in the applicant portal.",
  path: "/applicant",
  index: false,
});

export default async function ApplicantDashboard() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const app = application as Application | null;
  const status = (app?.status || "draft") as ApplicationStatus;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">
          Welcome{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your ACTI application from draft to enrollment.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Application status</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">
                {APPLICATION_STATUS_LABELS[status]}
              </Badge>
            </div>
          </div>
          <Link
            href="/applicant/application"
            className={cn(buttonVariants())}
          >
            {app ? "Continue application" : "Start application"}
          </Link>
        </div>
        {app?.submitted_at && (
          <p className="mt-4 text-sm text-muted-foreground">
            Submitted {new Date(app.submitted_at).toLocaleString("en-NG")}
          </p>
        )}
      </div>

      {status === "offered" && (
        <div className="rounded-xl border border-highlight/40 bg-highlight/15 p-6">
          <h2 className="font-display text-xl font-semibold">
            Congrats — you have an offer
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Transfer the acceptance fee using your unique reference so finance
            can confirm and enroll you.
          </p>
          <Link
            href="/applicant/payments"
            className={cn(buttonVariants(), "mt-4 inline-flex")}
          >
            Get acceptance fee reference
          </Link>
        </div>
      )}
    </div>
  );
}
