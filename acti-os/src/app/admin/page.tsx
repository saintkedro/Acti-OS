import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Admin overview",
  description:
    "ACTI OS admin overview — applications, payments, and enrollment metrics.",
  path: "/admin",
  index: false,
});

export default async function AdminDashboard() {
  await requireProfile(["admin"]);
  const supabase = await createClient();

  const [
    { count: applicationCount },
    { count: enrolledCount },
    { count: submittedCount },
    { data: revenueRows },
  ] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "enrolled"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "offered"]),
    supabase
      .from("payments")
      .select("amount_kobo")
      .eq("status", "success"),
  ]);

  const revenue = (revenueRows || []).reduce(
    (sum, row) => sum + (row.amount_kobo || 0),
    0,
  );

  const cards = [
    { label: "Total applications", value: String(applicationCount ?? 0) },
    { label: "In review / offered", value: String(submittedCount ?? 0) },
    { label: "Enrolled students", value: String(enrolledCount ?? 0) },
    { label: "Revenue collected", value: formatNaira(revenue) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">
          Administration
        </h1>
        <p className="mt-2 text-muted-foreground">
          Admissions, finance, and enrollment overview for ACTI OS Phase 1.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-white/80 p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
