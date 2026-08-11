import { cn } from "@/lib/utils";

/** Abstract campus-tech hero art — navy / teal / gold. */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="actiHeroA" x1="80" y1="40" x2="560" y2="480" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" stopOpacity="0.95" />
          <stop offset="1" stopColor="#0EA5A4" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="actiHeroB" x1="200" y1="80" x2="480" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <circle cx="520" cy="90" r="70" fill="url(#actiHeroA)" className="animate-edu-float" />
      <circle cx="110" cy="400" r="50" fill="white" fillOpacity="0.12" />
      <rect x="120" y="100" width="280" height="190" rx="28" fill="url(#actiHeroB)" stroke="white" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="150" y="130" width="100" height="12" rx="6" fill="white" fillOpacity="0.55" />
      <rect x="150" y="156" width="160" height="10" rx="5" fill="white" fillOpacity="0.3" />
      <rect x="150" y="180" width="140" height="10" rx="5" fill="white" fillOpacity="0.22" />
      <circle cx="190" cy="240" r="22" fill="#F59E0B" fillOpacity="0.95" />
      <circle cx="250" cy="240" r="22" fill="white" fillOpacity="0.35" />
      <circle cx="310" cy="240" r="22" fill="#0EA5A4" fillOpacity="0.55" />
      <path
        d="M360 320c40-60 120-70 170-30"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <rect x="340" y="300" width="200" height="140" rx="24" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.28" strokeWidth="2" />
      <path d="M380 360h120M380 390h80" stroke="white" strokeOpacity="0.45" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M70 180l40 20-40 20-40-20 40-20zM70 220l40 20v40l-40 20-40-20v-40l40-20z"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="2"
        fill="white"
        fillOpacity="0.08"
      />
    </svg>
  );
}

export function LearnIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={cn("h-auto w-full", className)} fill="none" aria-hidden>
      <rect x="24" y="36" width="200" height="140" rx="20" className="fill-brand-blue/15 stroke-brand-blue/40" strokeWidth="2" />
      <rect x="48" y="60" width="90" height="10" rx="5" className="fill-primary/70" />
      <rect x="48" y="84" width="140" height="8" rx="4" className="fill-brand-blue/35" />
      <rect x="48" y="106" width="120" height="8" rx="4" className="fill-brand-teal/40" />
      <circle cx="230" cy="160" r="48" className="fill-highlight/45" />
      <path d="M210 160h40M230 140v40" stroke="#0B1F3A" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function BuildIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={cn("h-auto w-full", className)} fill="none" aria-hidden>
      <rect x="40" y="50" width="160" height="120" rx="16" className="fill-primary/10 stroke-brand-blue/40" strokeWidth="2" />
      <path d="M70 150V90l40-20 40 20v60" className="stroke-primary" strokeWidth="3" fill="none" />
      <circle cx="230" cy="120" r="44" className="fill-brand-teal/40" />
      <path d="M210 120h40M215 105l30 30M215 135l30-30" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function InnovateIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={cn("h-auto w-full", className)} fill="none" aria-hidden>
      <circle cx="140" cy="120" r="70" className="fill-brand-blue/15" />
      <path
        d="M140 70c20 20 20 50 0 70-20-20-20-50 0-70z"
        className="fill-highlight/80"
      />
      <path d="M140 70v100M100 100h80M105 140h70" className="stroke-primary/50" strokeWidth="3" strokeLinecap="round" />
      <circle cx="240" cy="80" r="18" className="fill-brand-teal/50" />
      <circle cx="250" cy="160" r="28" className="fill-highlight/35" />
    </svg>
  );
}
