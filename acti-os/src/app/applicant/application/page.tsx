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
  DOCUMENT_TYPE_LABELS,
  type Application,
  type ApplicationDocument,
  type DocumentType,
  type Programme,
} from "@/lib/types";
import {
  NIGERIAN_STATES,
  lgasForState,
} from "@/lib/nigeria/states-lgas";
import { toast } from "sonner";

const STEPS = ["Personal", "Academic", "Programme", "Documents", "Review"] as const;

const GENDERS = ["Female", "Male"] as const;

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "passport_photo", label: DOCUMENT_TYPE_LABELS.passport_photo },
  { value: "national_id", label: DOCUMENT_TYPE_LABELS.national_id },
  { value: "certificate", label: DOCUMENT_TYPE_LABELS.certificate },
  { value: "transcript", label: DOCUMENT_TYPE_LABELS.transcript },
  { value: "other", label: DOCUMENT_TYPE_LABELS.other },
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

function hasRequiredDocuments(documents: ApplicationDocument[]) {
  const types = new Set(documents.map((d) => d.doc_type));
  return (
    types.has("passport_photo") &&
    (types.has("national_id") || types.has("certificate"))
  );
}

function requiredDocsMessage(documents: ApplicationDocument[]) {
  const types = new Set(documents.map((d) => d.doc_type));
  const missing: string[] = [];
  if (!types.has("passport_photo")) {
    missing.push(DOCUMENT_TYPE_LABELS.passport_photo);
  }
  if (!types.has("national_id") && !types.has("certificate")) {
    missing.push("National ID / NIN or Certificate / result");
  }
  return missing.length
    ? `Upload required documents: ${missing.join("; ")}`
    : null;
}

export default function ApplicationPage() {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [application, setApplication] = useState<Partial<Application> | null>(
    null,
  );
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocumentType>("passport_photo");
  const [file, setFile] = useState<File | null>(null);

  const locked = !["draft"].includes(application?.status || "draft");
  const lgaOptions = useMemo(
    () => lgasForState(application?.state_of_origin),
    [application?.state_of_origin],
  );

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

  async function saveFields(
    fields: Partial<Application>,
    nextStep?: number,
  ): Promise<boolean> {
    if (!application?.id) return false;
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
      return false;
    }
    setApplication(data as Application);
    toast.success("Saved");
    if (typeof nextStep === "number") setStep(nextStep);
    return true;
  }

  function validatePersonal(): string | null {
    if (!application?.date_of_birth) return "Date of birth is required";
    if (!application.gender) return "Gender is required";
    if (!(application.nationality || "Nigerian").trim()) {
      return "Nationality is required";
    }
    if (!application.state_of_origin) return "State of origin is required";
    if (!application.lga) return "LGA is required";
    if (!application.address?.trim()) return "Address is required";
    return null;
  }

  function validateAcademic(): string | null {
    if (!application?.highest_qualification?.trim()) {
      return "Highest qualification is required";
    }
    if (!application.previous_institution?.trim()) {
      return "Previous institution is required";
    }
    if (
      !application.graduation_year ||
      application.graduation_year < 1970 ||
      application.graduation_year > new Date().getFullYear() + 1
    ) {
      return "Enter a valid graduation year";
    }
    if (!application.personal_statement?.trim()) {
      return "Personal statement is required";
    }
    if (application.personal_statement.trim().length < 50) {
      return "Personal statement should be at least 50 characters";
    }
    return null;
  }

  function validateProgramme(): string | null {
    if (!application?.programme_id) return "Select a preferred programme";
    return null;
  }

  async function savePersonal() {
    const error = validatePersonal();
    if (error) {
      toast.error(error);
      return;
    }
    await saveFields(
      {
        date_of_birth: application!.date_of_birth,
        gender: application!.gender,
        nationality: application!.nationality || "Nigerian",
        state_of_origin: application!.state_of_origin,
        lga: application!.lga,
        address: application!.address,
      },
      1,
    );
  }

  async function saveAcademic() {
    const error = validateAcademic();
    if (error) {
      toast.error(error);
      return;
    }
    await saveFields(
      {
        highest_qualification: application!.highest_qualification,
        previous_institution: application!.previous_institution,
        graduation_year: application!.graduation_year,
        personal_statement: application!.personal_statement,
      },
      2,
    );
  }

  async function saveProgramme() {
    const error = validateProgramme();
    if (error) {
      toast.error(error);
      return;
    }
    await saveFields({ programme_id: application!.programme_id }, 3);
  }

  function goToStep(target: number) {
    if (locked) {
      setStep(target);
      return;
    }
    if (target > step) {
      if (step === 0) {
        const error = validatePersonal();
        if (error) {
          toast.error(error);
          return;
        }
      }
      if (step === 1 && target > 1) {
        const error = validateAcademic();
        if (error) {
          toast.error(error);
          return;
        }
      }
      if (step === 2 && target > 2) {
        const error = validateProgramme();
        if (error) {
          toast.error(error);
          return;
        }
      }
      if (target >= 4) {
        const docsError = requiredDocsMessage(documents);
        if (docsError) {
          toast.error(docsError);
          return;
        }
      }
    }
    setStep(target);
  }

  async function uploadDocument() {
    if (!file || !application?.id || !userId) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File must be 5 MB or smaller");
      return;
    }
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

  async function removeDocument(doc: ApplicationDocument) {
    if (locked) return;
    setSaving(true);
    await supabase.storage.from("application-docs").remove([doc.storage_path]);
    const { error } = await supabase
      .from("application_documents")
      .delete()
      .eq("id", doc.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Document removed");
  }

  async function payApplicationFee() {
    if (!application?.id) return;
    const personalError = validatePersonal();
    if (personalError) {
      toast.error(personalError);
      setStep(0);
      return;
    }
    const academicError = validateAcademic();
    if (academicError) {
      toast.error(academicError);
      setStep(1);
      return;
    }
    const programmeError = validateProgramme();
    if (programmeError) {
      toast.error(programmeError);
      setStep(2);
      return;
    }
    const docsError = requiredDocsMessage(documents);
    if (docsError) {
      toast.error(docsError);
      setStep(3);
      return;
    }

    // Persist latest draft values before payment
    const saved = await saveFields({
      date_of_birth: application.date_of_birth,
      gender: application.gender,
      nationality: application.nationality || "Nigerian",
      state_of_origin: application.state_of_origin,
      lga: application.lga,
      address: application.address,
      highest_qualification: application.highest_qualification,
      previous_institution: application.previous_institution,
      graduation_year: application.graduation_year,
      personal_statement: application.personal_statement,
      programme_id: application.programme_id,
    });
    if (!saved) return;

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

  const programmeName =
    programmes.find((p) => p.id === application.programme_id)?.name || "—";

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
            onClick={() => goToStep(i)}
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
              required
              value={application.date_of_birth || ""}
              onChange={(e) =>
                setApplication({ ...application, date_of_birth: e.target.value })
              }
            />
          </Field>
          <Field label="Gender">
            <select
              className={selectClassName}
              disabled={locked}
              required
              value={application.gender || ""}
              onChange={(e) =>
                setApplication({ ...application, gender: e.target.value })
              }
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nationality">
            <Input
              disabled={locked}
              required
              value={application.nationality || "Nigerian"}
              onChange={(e) =>
                setApplication({ ...application, nationality: e.target.value })
              }
            />
          </Field>
          <Field label="State of origin">
            <select
              className={selectClassName}
              disabled={locked}
              required
              value={application.state_of_origin || ""}
              onChange={(e) => {
                const state = e.target.value;
                setApplication({
                  ...application,
                  state_of_origin: state || null,
                  lga: null,
                });
              }}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </Field>
          <Field label="LGA">
            <select
              className={selectClassName}
              disabled={locked || !application.state_of_origin}
              required
              value={application.lga || ""}
              onChange={(e) =>
                setApplication({
                  ...application,
                  lga: e.target.value || null,
                })
              }
            >
              <option value="">
                {application.state_of_origin
                  ? "Select LGA"
                  : "Select state first"}
              </option>
              {lgaOptions.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
              {application.lga &&
                !lgaOptions.includes(application.lga) && (
                  <option value={application.lga}>{application.lga}</option>
                )}
            </select>
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Textarea
              disabled={locked}
              required
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
              onClick={savePersonal}
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
              required
              placeholder="e.g. SSCE, ND, HND"
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
              required
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
              required
              min={1970}
              max={new Date().getFullYear() + 1}
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
              required
              rows={5}
              placeholder="Tell us why you want to study at ACTI (min. 50 characters)"
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
              onClick={saveAcademic}
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
              className={selectClassName}
              disabled={locked}
              required
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
            <Button disabled={saving} onClick={saveProgramme}>
              Save & continue
            </Button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border bg-white/80 p-6">
          <p className="text-sm text-muted-foreground">
            Required: passport photograph, plus National ID/NIN or certificate.
            Max 5 MB per file (PDF or image).
          </p>
          {!locked && (
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Document type">
                <select
                  className={selectClassName}
                  value={docType}
                  onChange={(e) =>
                    setDocType(
                      (e.target.value as DocumentType) || "passport_photo",
                    )
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
                  accept="image/*,.pdf,application/pdf"
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
                className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-secondary/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{doc.file_name}</p>
                  <p className="text-muted-foreground">
                    {DOCUMENT_TYPE_LABELS[doc.doc_type]}
                  </p>
                </div>
                {!locked && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    onClick={() => removeDocument(doc)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
            {!documents.length && (
              <li className="text-muted-foreground">No documents uploaded yet.</li>
            )}
          </ul>
          <Button
            variant="outline"
            onClick={() => {
              const docsError = requiredDocsMessage(documents);
              if (docsError && !locked) {
                toast.error(docsError);
                return;
              }
              setStep(4);
            }}
          >
            Continue to review
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rounded-xl border bg-white/80 p-6">
          <h2 className="font-display text-xl font-semibold">Review & pay</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <ReviewBlock
              title="Personal"
              onEdit={locked ? undefined : () => setStep(0)}
              items={[
                ["Date of birth", application.date_of_birth || "—"],
                ["Gender", application.gender || "—"],
                ["Nationality", application.nationality || "—"],
                ["State of origin", application.state_of_origin || "—"],
                ["LGA", application.lga || "—"],
                ["Address", application.address || "—"],
              ]}
            />
            <ReviewBlock
              title="Academic"
              onEdit={locked ? undefined : () => setStep(1)}
              items={[
                [
                  "Highest qualification",
                  application.highest_qualification || "—",
                ],
                [
                  "Previous institution",
                  application.previous_institution || "—",
                ],
                [
                  "Graduation year",
                  application.graduation_year?.toString() || "—",
                ],
                ["Personal statement", application.personal_statement || "—"],
              ]}
            />
            <ReviewBlock
              title="Programme"
              onEdit={locked ? undefined : () => setStep(2)}
              items={[["Preferred programme", programmeName]]}
            />
            <ReviewBlock
              title="Documents"
              onEdit={locked ? undefined : () => setStep(3)}
              items={
                documents.length
                  ? documents.map((d) => [
                      DOCUMENT_TYPE_LABELS[d.doc_type],
                      d.file_name,
                    ])
                  : [["Uploads", "None"]]
              }
            />
          </div>
          {application.status === "draft" ? (
            <Button
              disabled={saving || !hasRequiredDocuments(documents)}
              onClick={payApplicationFee}
            >
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

function ReviewBlock({
  title,
  items,
  onEdit,
}: {
  title: string;
  items: [string, string][];
  onEdit?: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-primary">
          {title}
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium text-brand-teal underline-offset-4 hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      <dl className="space-y-2 text-sm">
        {items.map(([label, value]) => (
          <div key={`${title}-${label}-${value}`}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="whitespace-pre-wrap break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
