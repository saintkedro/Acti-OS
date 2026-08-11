import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_LABELS,
  type Application,
  type ApplicationDocument,
  type ApplicationStatus,
  type Programme,
  type Profile,
} from "@/lib/types";
import { DecisionForm } from "./decision-form";

type AppDetail = Application & {
  profiles: Profile | null;
  programmes: Programme | null;
};

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile(["admin"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("*, profiles(*), programmes(*)")
    .eq("id", id)
    .maybeSingle();

  if (!application) notFound();
  const app = application as AppDetail;

  const { data: documents } = await supabase
    .from("application_documents")
    .select("*")
    .eq("application_id", id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            {app.profiles?.full_name || "Applicant"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{app.profiles?.email}</p>
        </div>
        <Badge variant="secondary">
          {APPLICATION_STATUS_LABELS[app.status as ApplicationStatus]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white/80 p-5">
          <h2 className="font-display text-lg font-semibold">Details</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Item label="Programme" value={app.programmes?.name} />
            <Item label="Phone" value={app.profiles?.phone} />
            <Item label="DOB" value={app.date_of_birth} />
            <Item label="Gender" value={app.gender} />
            <Item label="State" value={app.state_of_origin} />
            <Item label="LGA" value={app.lga} />
            <Item label="Qualification" value={app.highest_qualification} />
            <Item label="Institution" value={app.previous_institution} />
            <Item
              label="Statement"
              value={app.personal_statement}
              className="sm:col-span-2"
            />
          </dl>
        </section>

        <section className="rounded-xl border bg-white/80 p-5">
          <h2 className="font-display text-lg font-semibold">Documents</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {((documents as ApplicationDocument[]) || []).map((doc) => (
              <li
                key={doc.id}
                className="flex justify-between gap-3 rounded-md bg-secondary/50 px-3 py-2"
              >
                <span>{doc.file_name}</span>
                <span className="text-muted-foreground">{doc.doc_type}</span>
              </li>
            ))}
            {!documents?.length && (
              <li className="text-muted-foreground">No documents uploaded.</li>
            )}
          </ul>

          {["submitted", "under_review", "waitlisted"].includes(app.status) && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Decision</h3>
              <DecisionForm applicationId={app.id} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value || "—"}</dd>
    </div>
  );
}
