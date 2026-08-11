"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ConfirmPaymentButton({ reference }: { reference: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    const res = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(json.error || "Could not confirm payment");
      return;
    }
    toast.success(
      json.alreadySettled ? "Already confirmed" : "Payment confirmed",
    );
    router.refresh();
  }

  return (
    <Button size="sm" onClick={confirm} disabled={loading}>
      {loading ? "Confirming…" : "Confirm received"}
    </Button>
  );
}
