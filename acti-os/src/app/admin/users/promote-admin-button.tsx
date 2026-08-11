"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PromoteAdminButton({ userId }: { userId: string }) {
  const router = useRouter();

  async function promote() {
    const res = await fetch("/api/admin/users/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed");
      return;
    }
    toast.success("User promoted to admin");
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" onClick={promote}>
      Make admin
    </Button>
  );
}
