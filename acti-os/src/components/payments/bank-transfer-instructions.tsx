"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/money";
import type { BankAccountDetails } from "@/lib/bank-transfer";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

type Props = {
  reference: string;
  amountKobo: number;
  bank: BankAccountDetails;
  feeLabel?: string;
};

export function BankTransferInstructions({
  reference,
  amountKobo,
  bank,
  feeLabel,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success("Copied");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Could not copy");
    }
  }

  const rows: { key: string; label: string; value: string; emphasize?: boolean }[] = [
    { key: "bank", label: "Bank", value: bank.bankName },
    { key: "name", label: "Account name", value: bank.accountName },
    { key: "number", label: "Account number", value: bank.accountNumber },
    { key: "amount", label: "Amount", value: formatNaira(amountKobo) },
    {
      key: "ref",
      label: "Payment reference",
      value: reference,
      emphasize: true,
    },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-primary/25 bg-white/90 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-primary">
          Pay by bank transfer
          {feeLabel ? ` — ${feeLabel}` : ""}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Transfer the exact amount and include this payment reference in the
          transfer narration / description so finance can confirm your payment.
        </p>
      </div>

      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 ${
              row.emphasize ? "bg-highlight/20" : "bg-secondary/40"
            }`}
          >
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {row.label}
              </dt>
              <dd
                className={`mt-0.5 ${
                  row.emphasize
                    ? "font-mono text-base font-bold tracking-wide"
                    : "text-sm font-medium"
                }`}
              >
                {row.value}
              </dd>
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => copy(row.value, row.key)}
              aria-label={`Copy ${row.label}`}
            >
              {copied === row.key ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        ))}
      </dl>

      <p className="text-xs text-muted-foreground">
        After you transfer, keep your receipt. An ACTI admin will confirm the
        payment using your reference — usually within 1–2 business days.
      </p>
    </div>
  );
}
