"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PasswordField } from "@/components/auth/password-field";
import { SiteHeader } from "@/components/site/site-chrome";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.user));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasSession(true);
        setReady(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("role").eq("id", user.id).single()
      : { data: null };

    const destination =
      profile?.role === "admin"
        ? "/admin"
        : profile?.role === "student"
          ? "/student"
          : "/applicant";
    router.push(destination);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#E8EEF7,#F8FAFC_55%)]">
      <SiteHeader variant="solid" />
      <div className="mx-auto flex max-w-md flex-col px-4 pb-16 pt-36">
        <h1 className="font-display text-3xl font-bold text-primary">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use at least 8 characters. You can show the password while you type.
        </p>
        {!ready ? (
          <p className="mt-8 text-sm text-muted-foreground">Checking your reset link…</p>
        ) : !hasSession ? (
          <div className="mt-8 space-y-4">
            <p role="alert" className="text-sm text-destructive">
              This reset link is missing or has expired. Request a new one and open it on this device.
            </p>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <PasswordField
              id="password"
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              invalid={mismatch}
              describedBy={mismatch ? "password-mismatch" : undefined}
            />
            {mismatch && (
              <p id="password-mismatch" role="alert" className="text-sm text-destructive">
                Passwords do not match.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || mismatch}>
              {loading ? "Saving…" : "Save password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
