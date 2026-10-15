"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrintCertificateButton() {
  return (
    <button
      type="button"
      className={cn(buttonVariants(), "print:hidden")}
      onClick={() => window.print()}
    >
      Print or save PDF
    </button>
  );
}
