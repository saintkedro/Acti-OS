"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { INSTITUTION } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programmes", label: "Programmes" },
  { href: "/admissions", label: "Admissions" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  variant = "solid",
}: {
  /** solid = sticky white bar; overlay = transparent over hero until scroll */
  variant?: "solid" | "overlay";
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlayMode = variant === "overlay" && !scrolled;
  const textMuted = overlayMode ? "text-white/80" : "text-muted-foreground";
  const textMain = overlayMode ? "text-white" : "text-foreground";
  const logo = overlayMode ? "text-white" : "text-primary";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        overlayMode
          ? "bg-transparent"
          : "border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "hidden border-b text-xs sm:block",
          overlayMode
            ? "border-white/15 bg-black/20 text-white/85"
            : "border-border/50 bg-primary text-primary-foreground",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <p className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 shrink-0 opacity-80" />
            <span className="truncate">{INSTITUTION.address}</span>
          </p>
          <Link
            href="/login"
            className="shrink-0 font-medium underline-offset-4 hover:underline"
          >
            Student portal
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="min-w-0">
          <span className={cn("font-display text-2xl font-bold tracking-tight", logo)}>
            {INSTITUTION.shortName}
          </span>
          <span
            className={cn(
              "mt-0.5 block truncate text-[10px] uppercase tracking-[0.16em] sm:text-[11px]",
              textMuted,
            )}
          >
            Amana College of Technology & Innovation
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  active
                    ? overlayMode
                      ? "bg-white/15 text-white"
                      : "bg-primary/10 text-primary"
                    : overlayMode
                      ? "text-white/85 hover:bg-white/10 hover:text-white"
                      : "text-foreground/75 hover:bg-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "ml-2 bg-highlight text-highlight-foreground hover:bg-highlight/90",
            )}
          >
            Apply now
          </Link>
        </nav>

        <button
          type="button"
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-lg border lg:hidden",
            overlayMode
              ? "border-white/30 text-white"
              : "border-border text-foreground",
          )}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href))
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-secondary",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-2 bg-highlight text-highlight-foreground hover:bg-highlight/90",
              )}
            >
              Apply now
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              Portal login
            </Link>
          </nav>
          <p className={cn("mt-4 text-xs", textMain, "!text-muted-foreground")}>
            {INSTITUTION.address}
          </p>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl font-bold">{INSTITUTION.shortName}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/80">
            {INSTITUTION.tagline} A next-generation college for technology,
            technical education, innovation, and entrepreneurship.
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">
            Founded by {INSTITUTION.founder}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-highlight">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/85">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className="hover:text-white">
                Portal login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-highlight">
            Campus
          </p>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85">
            {INSTITUTION.address}
          </p>
          <Link
            href="/signup"
            className={cn(
              buttonVariants(),
              "mt-5 bg-highlight text-highlight-foreground hover:bg-highlight/90",
            )}
          >
            Apply now
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-primary-foreground/55">
        © {new Date().getFullYear()} {INSTITUTION.name}. All rights reserved.
      </div>
    </footer>
  );
}
