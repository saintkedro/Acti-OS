import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { redirect } from "next/navigation";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function requireProfile(roles?: Profile["role"][]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (roles && !roles.includes(profile.role)) {
    redirect(
      profile.role === "admin"
        ? "/admin"
        : profile.role === "student"
          ? "/student"
          : "/applicant",
    );
  }
  return profile;
}
