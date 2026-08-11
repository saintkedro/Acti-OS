import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_LABELS,
  type Application,
  type ApplicationStatus,
  type Programme,
  type Profile,
} from "@/lib/types";

type Row = Application & {
  profiles: Pick<Profile, "full_name" | "email"> | null;
  programmes: Pick<Programme, "name" | "code"> | null;
};

export default async function AdminApplicationsPage() {
  await requireProfile(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("*, profiles(full_name, email), programmes(name, code)")
    .order("created_at", { ascending: false });

  const rows = (data as Row[]) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">
          Applications
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review submitted applications and issue admission decisions.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white/80">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Programme</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{row.profiles?.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.profiles?.email}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {row.programmes
                    ? `${row.programmes.code} — ${row.programmes.name}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {APPLICATION_STATUS_LABELS[row.status as ApplicationStatus]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.submitted_at
                    ? new Date(row.submitted_at).toLocaleDateString("en-NG")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/applications/${row.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
