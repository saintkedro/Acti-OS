"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function DecisionForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function decide(decision: "offered" | "rejected" | "waitlisted") {
    setLoading(decision);
    const res = await fetch("/api/admin/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, decision, notes }),
    });
    const json = await res.json();
    setLoading(null);
    if (!res.ok) {
      toast.error(json.error || "Decision failed");
      return;
    }
    toast.success("Decision recorded");
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-3">
      <Textarea
        placeholder="Notes for the applicant (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button disabled={!!loading} onClick={() => decide("offered")}>
          {loading === "offered" ? "Saving…" : "Offer admission"}
        </Button>
        <Button
          variant="secondary"
          disabled={!!loading}
          onClick={() => decide("waitlisted")}
        >
          Waitlist
        </Button>
        <Button
          variant="destructive"
          disabled={!!loading}
          onClick={() => decide("rejected")}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
