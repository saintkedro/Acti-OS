"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BankTransferInstructions } from "@/components/payments/bank-transfer-instructions";
import type { BankAccountDetails } from "@/lib/bank-transfer";
import { FEE_TYPE_LABELS, type FeeType } from "@/lib/types";
import { toast } from "sonner";

type CreateResponse = {
  paymentId: string;
  reference: string;
  amountKobo: number;
  feeType: FeeType;
  bank: BankAccountDetails;
  error?: string;
};

export function RequestBankPaymentButton({
  feeType,
  applicationId,
  label,
}: {
  feeType: FeeType;
  applicationId: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState<CreateResponse | null>(null);

  async function requestPayment() {
    setLoading(true);
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feeType, applicationId }),
    });
    const json = (await res.json()) as CreateResponse;
    setLoading(false);
    if (!res.ok) {
      toast.error(json.error || "Could not create payment reference");
      return;
    }
    setInstructions(json);
    router.refresh();
  }

  if (instructions) {
    return (
      <BankTransferInstructions
        reference={instructions.reference}
        amountKobo={instructions.amountKobo}
        bank={instructions.bank}
        feeLabel={FEE_TYPE_LABELS[instructions.feeType]}
      />
    );
  }

  return (
    <Button onClick={requestPayment} disabled={loading}>
      {loading ? "Generating reference…" : label}
    </Button>
  );
}
