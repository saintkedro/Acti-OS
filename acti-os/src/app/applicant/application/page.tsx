"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_LABELS,
  type Application,
  type ApplicationDocument,
  type DocumentType,
  type Programme,
} from "@/lib/types";
import { toast } from "sonner";

const STEPS = ["Personal", "Academic", "Programme", "Documents", "Review"] as const;

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "passport_photo", label: "Passport photograph" },
  { value: "national_id", label: "National ID / NIN slip" },
  { value: "certificate", label: "Certificate / result" },
  { value: "transcript", label: "Transcript (optional)" },
  { value: "other", label: "Other" },
];

export default function ApplicationPage() {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [application, setApplication] = useState<Partial<Application> | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocumentType>("passport_photo");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: progs }, { data: apps }] = await Promise.all([
        supabase.from("programmes").select("*").eq("is_active", true).order("name"),
        supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      setProgrammes((progs as Programme[]) || []);
      let app = (apps?.[0] as Application) || null;

      if (!app) {
        const { data: created, error } = await supabase
          .from("applications")
          .insert({ user_id: user.id, status: "draft" })
          .select("*")
          .single();
        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        app = created as Application;
      }

      setApplication(app);
      const { data: docs } = await supabase
        .from("application_documents")
        .select("*")
        .eq("application_id", app.id);
      setDocuments((docs as ApplicationDocument[]) || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function saveFields(fields: Partial<Application>) {
    if (!application?.id) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("applications")
      .update(fields)
      .eq("id", application.id)
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setApplication(data as Application);
    toast.success("Saved");
  }

  async function uploadDocument() {
    if (!file || !application?.id || !userId) return;
    setSaving(true);
    const path = `${userId}/${application.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("application-docs")
      .upload(path, file);
    if (uploadError) {
      toast.error(uploadError.message);
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("application_documents")
      .insert({
        application_id: application.id,
        user_id: userId,
        doc_type: docType,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type,
      })
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDocuments((prev) => [...prev, data as ApplicationDocument]);
    setFile(null);
    toast.success("Document uploaded");
  }

  async function payApplicationFee() {
    if (!application?.id) return;
    if (!application.programme_id) {
      toast.error("Select a programme before paying");
      return;
    }
    if (documents.length < 2) {
      toast.error("Upload at least passport photo and ID/certificate");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feeType: "application_fee",
        applicationId: application.id,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(json.error || "Could not create payment reference");
      return;
    }
    window.location.href = `/applicant/payments?ref=${encodeURIComponent(json.reference)}`;
  }

  if (loading || !application) {
    return <p className="text-sm text-muted-foreground">Loading application…</p>;
  }

  const locked = !["draft"].includes(application.status || "draft");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Application
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete each step, then pay the application fee to submit.
          </p>
        </div>
        <Badge variant="secondary">
          {APPLICATION_STATUS_LABELS[application.status || "draft"]}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              step === i
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-4 rounded-xl border bg-white/80 p-6 sm:grid-cols-2">
          <Field label="Date of birth">
            <Input
              type="date"
              disabled={locked}
              value={application.date_of_birth || ""}
              onChange={(e) =>
                setApplication({ ...application, date_of_birth: e.target.value })
              }
            />
          </Field>
          <Field label="Gender">
            <Input
              disabled={locked}
              value={application.gender || ""}
              onChange={(e) =>
                setApplication({ ...application, gender: e.target.value })
              }
            />
          </Field>
          <Field label="Nationality">
            <Input
              disabled={locked}
              value={application.nationality || "Nigerian"}
              onChange={(e) =>
                setApplication({ ...application, nationality: e.target.value })
              }
            />
          </Field>
          <Field label="State of origin">
            <Input
              disabled={locked}
              value={application.state_of_origin || ""}
              onChange={(e) =>
                setApplication({ ...application, state_of_origin: e.target.value })
              }
            />
          </Field>
          <Field label="LGA">
            <Input
              disabled={locked}
              value={application.lga || ""}
              onChange={(e) =>
                setApplication({ ...application, lga: e.target.value })
              }
            />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Textarea
              disabled={locked}
              value={application.address || ""}
              onChange={(e) =>
                setApplication({ ...application, address: e.target.value })
              }
            />
          </Field>
          {!locked && (
            <Button
              className="sm:col-span-2"
              disabled={saving}
              onClick={() =>
                saveFields({
                  date_of_birth: application.date_of_birth,
                  gender: application.gender,
                  nationality: application.nationality,
                  state_of_origin: application.state_of_origin,
                  lga: application.lga,
                  address: application.address,
                })
              }
            >
              Save & continue
            </Button>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 rounded-xl border bg-white/80 p-6 sm:grid-cols-2">
          <Field label="Highest qualification">
            <Input
              disabled={locked}
              value={application.highest_qualification || ""}
              onChange={(e) =>
                setApplication({
                  ...application,
                  highest_qualification: e.target.value,
                })
              }
            />
          </Field>
          <Field label="Previous institution">
            <Input
              disabled={locked}
              value={application.previous_institution || ""}
              onChange={(e) =>
                setApplication({
                  ...application,
                  previous_institution: e.target.value,
                })
              }
            />
          </Field>
          <Field label="Graduation year">
            <Input
              type="number"
              disabled={locked}
              value={application.graduation_year || ""}
              onChange={(e) =>
                setApplication({
                  ...application,
                  graduation_year: Number(e.target.value) || null,
                })
              }
            />
          </Field>
          <Field label="Personal statement" className="sm:col-span-2">
            <Textarea
              disabled={locked}
              rows={5}
              value={application.personal_statement || ""}
              onChange={(e) =>
                setApplication({
                  ...application,
                  personal_statement: e.target.value,
                })
              }
            />
          </Field>
          {!locked && (
            <Button
              className="sm:col-span-2"
              disabled={saving}
              onClick={() => {
                saveFields({
                  highest_qualification: application.highest_qualification,
                  previous_institution: application.previous_institution,
                  graduation_year: application.graduation_year,
                  personal_statement: application.personal_statement,
                });
                setStep(2);
              }}
            >
              Save & continue
            </Button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border bg-white/80 p-6">
          <Field label="Preferred programme">
            <select
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              disabled={locked}
              value={application.programme_id || ""}
              onChange={(e) =>
                setApplication({
                  ...application,
                  programme_id: e.target.value || null,
                })
              }
            >
              <option value="">Select a programme</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          {!locked && (
            <Button
              disabled={saving}
              onClick={() => {
                saveFields({ programme_id: application.programme_id });
                setStep(3);
              }}
            >
              Save & continue
            </Button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border bg-white/80 p-6">
          {!locked && (
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Document type">
                <select
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                  value={docType}
                  onChange={(e) =>
                    setDocType((e.target.value as DocumentType) || "passport_photo")
                  }
                >
                  {DOC_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="File">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Field>
              <div className="flex items-end">
                <Button disabled={saving || !file} onClick={uploadDocument}>
                  Upload
                </Button>
              </div>
            </div>
          )}
          <ul className="space-y-2 text-sm">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex justify-between gap-3 rounded-md bg-secondary/60 px-3 py-2"
              >
                <span>{doc.file_name}</span>
                <span className="text-muted-foreground">{doc.doc_type}</span>
              </li>
            ))}
            {!documents.length && (
              <li className="text-muted-foreground">No documents uploaded yet.</li>
            )}
          </ul>
          <Button variant="outline" onClick={() => setStep(4)}>
            Continue to review
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rounded-xl border bg-white/80 p-6">
          <h2 className="font-display text-xl font-semibold">Review & pay</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Programme</dt>
              <dd>
                {programmes.find((p) => p.id === application.programme_id)?.name ||
                  "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Documents</dt>
              <dd>{documents.length} uploaded</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">State of origin</dt>
              <dd>{application.state_of_origin || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Qualification</dt>
              <dd>{application.highest_qualification || "—"}</dd>
            </div>
          </dl>
          {application.status === "draft" ? (
            <Button disabled={saving} onClick={payApplicationFee}>
              Get bank transfer reference & submit
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              This application is {APPLICATION_STATUS_LABELS[application.status!]}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
