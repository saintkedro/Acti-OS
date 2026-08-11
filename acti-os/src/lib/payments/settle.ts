import { createServiceClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications";
import type { FeeType } from "@/lib/types";

/**
 * Idempotent settlement after admin confirms a bank transfer.
 * Looks up by unique payment reference (stored in paystack_reference column).
 */
export async function settleSuccessfulPayment(reference: string) {
  const admin = createServiceClient();

  const { data: payment, error } = await admin
    .from("payments")
    .select("*")
    .eq("paystack_reference", reference)
    .single();

  if (error || !payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === "success") {
    return { payment, alreadySettled: true };
  }

  const paidAt = new Date().toISOString();

  await admin
    .from("payments")
    .update({ status: "success", paid_at: paidAt })
    .eq("id", payment.id);

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", payment.user_id)
    .single();

  const feeType = payment.fee_type as FeeType;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (feeType === "application_fee" && payment.application_id) {
    await admin
      .from("applications")
      .update({
        status: "submitted",
        submitted_at: paidAt,
      })
      .eq("id", payment.application_id)
      .in("status", ["draft", "submitted"]);

    await notifyUser({
      userId: payment.user_id,
      email: profile?.email,
      title: "Application fee confirmed",
      body: "Your application fee transfer has been confirmed. Your application is now submitted for review.",
      link: `${appUrl}/applicant/application`,
    });
  }

  if (feeType === "acceptance_fee" && payment.application_id) {
    let studentId = profile?.student_id;
    if (!studentId) {
      const { data: generated } = await admin.rpc("generate_student_id");
      studentId = generated as string;

      await admin
        .from("profiles")
        .update({ role: "student", student_id: studentId })
        .eq("id", payment.user_id);
    } else {
      await admin
        .from("profiles")
        .update({ role: "student" })
        .eq("id", payment.user_id);
    }

    await admin
      .from("applications")
      .update({
        status: "enrolled",
        enrolled_at: paidAt,
      })
      .eq("id", payment.application_id);

    await notifyUser({
      userId: payment.user_id,
      email: profile?.email,
      title: "Welcome to ACTI",
      body: `Acceptance fee confirmed. Your student ID is ${studentId}. You are now enrolled.`,
      link: `${appUrl}/student`,
    });
  }

  if (feeType === "tuition") {
    await notifyUser({
      userId: payment.user_id,
      email: profile?.email,
      title: "Tuition payment confirmed",
      body: "Your tuition transfer has been confirmed. A receipt is available in your portal.",
      link: `${appUrl}/student/payments`,
    });
  }

  return { payment, alreadySettled: false };
}
