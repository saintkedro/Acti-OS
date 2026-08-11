import { createServiceClient } from "@/lib/supabase/admin";

type NotifyArgs = {
  userId: string;
  title: string;
  body: string;
  link?: string;
  email?: string;
};

export async function notifyUser({
  userId,
  title,
  body,
  link,
  email,
}: NotifyArgs) {
  const admin = createServiceClient();

  await admin.from("notifications").insert({
    user_id: userId,
    title,
    body,
    link: link ?? null,
  });

  if (email && process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "ACTI OS <onboarding@resend.dev>",
          to: [email],
          subject: title,
          text: body + (link ? `\n\nOpen: ${link}` : ""),
        }),
      });
    } catch {
      // In-app notification already stored; email is best-effort.
    }
  }
}
