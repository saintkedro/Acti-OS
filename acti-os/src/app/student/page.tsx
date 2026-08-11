import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Application, Programme } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const profile = await requireProfile(["student", "admin"]);
  const params = await searchParams;
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("*, programmes(*)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const app = application as (Application & { programmes: Programme | null }) | null;

  return (
    <div className="space-y-8">
      {params.enrolled === "1" && (
        <p className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Enrollment complete. Welcome to ACTI.
        </p>
      )}
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">
          Student dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your ACTI OS student profile for Phase 1. Course registration arrives
          in Phase 2.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white/80 p-5">
          <p className="text-sm text-muted-foreground">Student ID</p>
          <p className="mt-2 font-display text-2xl font-bold">
            {profile.student_id || "Pending"}
          </p>
        </div>
        <div className="rounded-xl border bg-white/80 p-5">
          <p className="text-sm text-muted-foreground">Programme</p>
          <p className="mt-2 font-display text-xl font-semibold">
            {app?.programmes?.name || "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-5">
        <div className="flex gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-teal/15 text-brand-teal">
            <BookOpen className="size-5" />
          </div>
          <div>
            <p className="font-display font-semibold text-primary">E-Library</p>
            <p className="text-sm text-muted-foreground">
              Access curated guides, handouts, and learning links.
            </p>
          </div>
        </div>
        <Link href="/student/library" className={cn(buttonVariants())}>
          Open E-Library
        </Link>
      </div>

      <div className="rounded-xl border bg-white/80 p-5">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd>{profile.full_name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{profile.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Enrollment</dt>
            <dd>
              {app?.enrolled_at
                ? new Date(app.enrolled_at).toLocaleDateString("en-NG")
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
