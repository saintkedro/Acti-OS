"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { Bell, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { href: string; label: string };

export function PortalShell({
  profile,
  nav,
  children,
}: {
  profile: Profile;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const base =
    profile.role === "admin"
      ? "admin"
      : profile.role === "student"
        ? "student"
        : "applicant";

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "rounded-md px-3 py-2 text-sm transition",
            pathname === item.href || pathname.startsWith(item.href + "/")
              ? "bg-primary text-primary-foreground"
              : "text-foreground/80 hover:bg-secondary",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#E8EEF7_0%,#F8FAFC_45%,#F8FAFC_100%)]">
      <header className="border-b border-border/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" className="md:hidden" />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>ACTI OS</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <NavLinks onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="font-display text-lg font-bold text-primary">ACTI OS</p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile.role} portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${base}/notifications`}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Bell className="size-4" />
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {profile.full_name || profile.email}
              </p>
              {profile.student_id && (
                <p className="text-xs text-muted-foreground">{profile.student_id}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <NavLinks />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
