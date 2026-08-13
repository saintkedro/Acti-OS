import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { ConfirmPaymentButton } from "@/components/payments/confirm-payment-button";
import { FEE_TYPE_LABELS, type FeeType, type Payment, type Profile } from "@/lib/types";

import { pageMetadata } from "@/lib/seo";

type Row = Payment & { profiles: Pick<Profile, "full_name" | "email"> | null };

export const metadata = pageMetadata({
  title: "Confirm payments",
  description:
    "Confirm bank transfer payments for ACTI applicants and students.",
  path: "/admin/payments",
  index: false,
});

export default async function AdminPaymentsPage() {
  await requireProfile(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data as Row[]) || [];
  const revenue = rows
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount_kobo, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Payments</h1>
          <p className="mt-2 text-muted-foreground">
            Match bank transfers to payment references, then confirm.
          </p>
        </div>
        <p className="text-sm">
          Confirmed total (page): <strong>{formatNaira(revenue)}</strong>
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white/80">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Payer</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p>{p.profiles?.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{p.profiles?.email}</p>
                </td>
                <td className="px-4 py-3">
                  {FEE_TYPE_LABELS[p.fee_type as FeeType]}
                </td>
                <td className="px-4 py-3">{formatNaira(p.amount_kobo)}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold">
                  {p.paystack_reference}
                </td>
                <td className="px-4 py-3 capitalize">
                  {p.status === "pending" ? "Awaiting confirmation" : p.status}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "pending" && (
                    <ConfirmPaymentButton reference={p.paystack_reference} />
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
