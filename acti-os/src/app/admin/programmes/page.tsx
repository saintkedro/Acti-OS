import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import {
  FEE_TYPE_LABELS,
  PILLAR_LABELS,
  type FeeSchedule,
  type FeeType,
  type Programme,
  type ProgrammePillar,
} from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Manage programmes",
  description: "View ACTI programme catalogue and fee schedules.",
  path: "/admin/programmes",
  index: false,
});

export default async function AdminProgrammesPage() {
  await requireProfile(["admin"]);
  const supabase = await createClient();
  const [{ data: programmes }, { data: fees }] = await Promise.all([
    supabase.from("programmes").select("*").order("name"),
    supabase.from("fee_schedules").select("*").order("fee_type"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">
          Programmes & fees
        </h1>
        <p className="mt-2 text-muted-foreground">
          Catalogue seeded from the ACTI institutional profile. Edit in Supabase
          or extend with admin CRUD in a later iteration.
        </p>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">Fee schedules</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {((fees as FeeSchedule[]) || []).map((fee) => (
            <li
              key={fee.id}
              className="flex justify-between rounded-md border bg-white/80 px-4 py-3"
            >
              <span>
                {FEE_TYPE_LABELS[fee.fee_type as FeeType]}
                {fee.programme_id ? " (programme-specific)" : " (global)"}
              </span>
              <span className="font-medium">{formatNaira(fee.amount_kobo)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Programmes</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border bg-white/80">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Pillar</th>
                <th className="px-4 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {((programmes as Programme[]) || []).map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{p.code}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">
                    {PILLAR_LABELS[p.pillar as ProgrammePillar]}
                  </td>
                  <td className="px-4 py-3">{p.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
