import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFeeAmountKobo } from "@/lib/fees";
import {
  generatePaymentReference,
  getBankAccountDetails,
} from "@/lib/bank-transfer";
import { formatNaira } from "@/lib/money";
import type { FeeType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feeType = body.feeType as FeeType;
    const applicationId = body.applicationId as string | undefined;

    if (
      !feeType ||
      !["application_fee", "acceptance_fee", "tuition"].includes(feeType)
    ) {
      return NextResponse.json({ error: "Invalid fee type" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let programmeId: string | null = null;
    if (applicationId) {
      const { data: application } = await supabase
        .from("applications")
        .select("*")
        .eq("id", applicationId)
        .eq("user_id", user.id)
        .single();

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 },
        );
      }

      if (feeType === "acceptance_fee" && application.status !== "offered") {
        return NextResponse.json(
          { error: "Acceptance fee is only available after an offer" },
          { status: 400 },
        );
      }

      programmeId = application.programme_id;
    }

    const amountKobo = await getFeeAmountKobo(feeType, programmeId);
    if (!amountKobo) {
      return NextResponse.json(
        { error: "Fee schedule not configured" },
        { status: 400 },
      );
    }

    // Reuse an existing pending payment for the same fee + application
    let existingQuery = supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("fee_type", feeType)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (applicationId) {
      existingQuery = existingQuery.eq("application_id", applicationId);
    } else {
      existingQuery = existingQuery.is("application_id", null);
    }

    const { data: existingRows } = await existingQuery;
    const existing = existingRows?.[0];

    if (existing) {
      return NextResponse.json({
        paymentId: existing.id,
        reference: existing.paystack_reference,
        amountKobo: existing.amount_kobo,
        amountFormatted: formatNaira(existing.amount_kobo),
        feeType,
        bank: getBankAccountDetails(),
        reused: true,
      });
    }

    let reference = generatePaymentReference(feeType);
    let payment = null;
    let paymentError = null;

    // Rare collision retry
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          application_id: applicationId || null,
          fee_type: feeType,
          amount_kobo: amountKobo,
          status: "pending",
          paystack_reference: reference,
          metadata: { method: "bank_transfer" },
        })
        .select("*")
        .single();

      payment = result.data;
      paymentError = result.error;
      if (!paymentError) break;
      if (paymentError.code === "23505") {
        reference = generatePaymentReference(feeType);
        continue;
      }
      break;
    }

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: paymentError?.message || "Could not create payment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      paymentId: payment.id,
      reference: payment.paystack_reference,
      amountKobo: payment.amount_kobo,
      amountFormatted: formatNaira(payment.amount_kobo),
      feeType,
      bank: getBankAccountDetails(),
      reused: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
