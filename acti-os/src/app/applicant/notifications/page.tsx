import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MarkReadButton } from "@/components/notifications/mark-read-button";
import type { Notification } from "@/lib/types";

export default async function ApplicantNotificationsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const notifications = (data as Notification[]) || [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Notifications</h1>
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border bg-white/80 p-4 ${n.read_at ? "opacity-70" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("en-NG")}
                </p>
              </div>
              {!n.read_at && <MarkReadButton id={n.id} />}
            </div>
          </li>
        ))}
        {!notifications.length && (
          <li className="text-sm text-muted-foreground">No notifications yet.</li>
        )}
      </ul>
    </div>
  );
}
