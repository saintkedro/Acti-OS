import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { settleSuccessfulPayment } from "@/lib/payments/settle";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const reference = body.reference as string | undefined;

  if (!reference) {
    return NextResponse.json({ error: "reference required" }, { status: 400 });
  }

  try {
    const result = await settleSuccessfulPayment(reference);
    return NextResponse.json({
      ok: true,
      alreadySettled: result.alreadySettled,
      feeType: result.payment.fee_type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Confirm failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
