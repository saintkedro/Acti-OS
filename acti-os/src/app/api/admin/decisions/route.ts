import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications";
import type { AdmissionDecisionType } from "@/lib/types";

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
  const applicationId = body.applicationId as string;
  const decision = body.decision as AdmissionDecisionType;
  const notes = (body.notes as string) || null;

  if (!applicationId || !["offered", "rejected", "waitlisted"].includes(decision)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { data: application } = await admin
    .from("applications")
    .select("*, profiles(email, full_name)")
    .eq("id", applicationId)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  await admin.from("admission_decisions").insert({
    application_id: applicationId,
    decision,
    notes,
    decided_by: user.id,
  });

  await admin
    .from("applications")
    .update({ status: decision === "offered" ? "offered" : decision })
    .eq("id", applicationId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const titles: Record<AdmissionDecisionType, string> = {
    offered: "Admission offer from ACTI",
    rejected: "Admission decision update",
    waitlisted: "You have been waitlisted",
  };
  const bodies: Record<AdmissionDecisionType, string> = {
    offered:
      "Congratulations! You have been offered admission. Sign in to pay your acceptance fee and enroll." +
      (notes ? `\n\nNote: ${notes}` : ""),
    rejected:
      "Thank you for applying to ACTI. We are unable to offer admission at this time." +
      (notes ? `\n\nNote: ${notes}` : ""),
    waitlisted:
      "Your application has been waitlisted. We will update you if a place becomes available." +
      (notes ? `\n\nNote: ${notes}` : ""),
  };

  const applicant = application.profiles as { email?: string; full_name?: string } | null;

  await notifyUser({
    userId: application.user_id,
    email: applicant?.email,
    title: titles[decision],
    body: bodies[decision],
    link: `${appUrl}/applicant`,
  });

  return NextResponse.json({ ok: true });
}
