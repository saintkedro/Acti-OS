import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";
import { PromoteAdminButton } from "./promote-admin-button";

export const metadata = pageMetadata({
  title: "Manage users",
  description: "View ACTI OS users and promote administrators.",
  path: "/admin/users",
  index: false,
});

export default async function AdminUsersPage() {
  const me = await requireProfile(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const users = (data as Profile[]) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Users</h1>
        <p className="mt-2 text-muted-foreground">
          Profiles created via ACTI OS signup. Promote trusted staff to admin.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white/80">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Student ID</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3">{u.full_name || "—"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{u.role}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {u.student_id || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== me.id && u.role !== "admin" && (
                    <PromoteAdminButton userId={u.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
