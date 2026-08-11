import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/money";
import { getBankAccountDetails } from "@/lib/bank-transfer";
import { BankTransferInstructions } from "@/components/payments/bank-transfer-instructions";
import { RequestBankPaymentButton } from "@/components/payments/request-bank-payment-button";
import { FEE_TYPE_LABELS, type FeeType, type Payment } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function ApplicantPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  const supabase = await createClient();
  const bank = getBankAccountDetails();

  const [{ data: payments }, { data: application }] = await Promise.all([
    supabase
      .from("payments")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const list = (payments as Payment[] | null) || [];
  const highlighted =
    list.find((p) => p.paystack_reference === params.ref) ||
    list.find((p) => p.status === "pending") ||
    null;

  const pendingAcceptance =
    application?.status === "offered" &&
    !list.some(
      (p) =>
        p.fee_type === "acceptance_fee" &&
        (p.status === "pending" || p.status === "success"),
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Payments</h1>
        <p className="mt-2 text-muted-foreground">
          Pay fees by bank transfer using your unique payment reference.
        </p>
      </div>

      {highlighted?.status === "pending" && (
        <BankTransferInstructions
          reference={highlighted.paystack_reference}
          amountKobo={highlighted.amount_kobo}
          bank={bank}
          feeLabel={FEE_TYPE_LABELS[highlighted.fee_type as FeeType]}
        />
      )}

      {pendingAcceptance && application && (
        <div className="rounded-xl border border-highlight/40 bg-highlight/15 p-5">
          <p className="font-medium">Acceptance fee required</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate your payment reference, transfer the fee, and include the
            code in the narration. Admin will confirm to enroll you.
          </p>
          <div className="mt-4">
            <RequestBankPaymentButton
              feeType="acceptance_fee"
              applicationId={application.id}
              label="Get acceptance fee reference"
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  {FEE_TYPE_LABELS[p.fee_type as FeeType]}
                </td>
                <td className="px-4 py-3">{formatNaira(p.amount_kobo)}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {p.paystack_reference}
                </td>
                <td className="px-4 py-3 capitalize">
                  {p.status === "pending" ? "Awaiting confirmation" : p.status}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(p.paid_at || p.created_at).toLocaleString("en-NG")}
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No payments yet.{" "}
                  <Link
                    href="/applicant/application"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Complete your application
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link
        href="/applicant"
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
