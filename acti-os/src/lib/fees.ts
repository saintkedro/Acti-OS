import type { FeeType } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function getFeeAmountKobo(
  feeType: FeeType,
  programmeId?: string | null,
) {
  const supabase = await createClient();

  if (programmeId) {
    const { data } = await supabase
      .from("fee_schedules")
      .select("amount_kobo")
      .eq("fee_type", feeType)
      .eq("programme_id", programmeId)
      .eq("is_active", true)
      .maybeSingle();

    if (data?.amount_kobo) return data.amount_kobo;
  }

  const { data: globalFee } = await supabase
    .from("fee_schedules")
    .select("amount_kobo")
    .eq("fee_type", feeType)
    .is("programme_id", null)
    .eq("is_active", true)
    .maybeSingle();

  return globalFee?.amount_kobo ?? null;
}
