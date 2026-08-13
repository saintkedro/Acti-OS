import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";
import { FEE_TYPE_LABELS, type FeeType, type Payment } from "@/lib/types";

export const metadata = pageMetadata({
  title: "Student payments",
  description: "View and manage your ACTI fee payment history.",
  path: "/student/payments",
  index: false,
});

export default async function StudentPaymentsPage() {
  const profile = await requireProfile(["student", "admin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", profile.id)
    .eq("status", "success")
    .order("paid_at", { ascending: false });

  const payments = (data as Payment[]) || [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">
        Payment history
      </h1>
      <div className="overflow-hidden rounded-xl border bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Paid</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  {FEE_TYPE_LABELS[p.fee_type as FeeType]}
                </td>
                <td className="px-4 py-3">{formatNaira(p.amount_kobo)}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.paystack_reference}</td>
                <td className="px-4 py-3">
                  {p.paid_at ? new Date(p.paid_at).toLocaleString("en-NG") : "—"}
                </td>
              </tr>
            ))}
            {!payments.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No successful payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
