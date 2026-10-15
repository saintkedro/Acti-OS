import { requireProfile } from "@/lib/auth";
import { QueryBanner } from "@/components/courses/query-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "@/app/admin/courses/actions";
import { readQueryMessage } from "@/lib/courses/form";
import { COURSE_PILLAR_LABELS, DELIVERY_LABELS } from "@/lib/courses/labels";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "New short course",
  description: "Create a draft ACTI short course.",
  path: "/admin/courses/new",
  index: false,
});

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireProfile(["admin"]);
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">New short course</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This saves a draft. It will not appear in the catalogue until you publish it.
        </p>
      </div>
      <QueryBanner error={readQueryMessage(params.error)} />
      <form action={createCourse} className="space-y-4 rounded-xl border bg-white/80 p-5">
        <Field label="Title" name="title" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" name="code" required placeholder="AI-ESS" />
          <Field label="Slug" name="slug" placeholder="ai-essentials" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Pillar</span>
            <select name="pillar" required className={selectClass} defaultValue="technology">
              {Object.entries(COURSE_PILLAR_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Delivery</span>
            <select name="delivery" required className={selectClass} defaultValue="online">
              {Object.entries(DELIVERY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Summary</span>
          <Textarea name="summary" rows={3} />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Description</span>
          <Textarea name="description" rows={6} />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Learning outcomes</span>
          <Textarea name="outcomes" rows={4} placeholder="One outcome per line" />
        </label>
        <Field label="Duration" name="duration_label" placeholder="About 30 minutes" />
        <Field label="Audience" name="audience" />
        <Field label="Prerequisites" name="prerequisites" />
        <Field label="Instructor name" name="instructor_name" placeholder="ACTI short-course team" />
        <label className="space-y-2 text-sm">
          <span className="font-medium">Instructor bio</span>
          <Textarea name="instructor_bio" rows={3} />
        </label>
        <Field label="Keywords" name="keywords" placeholder="ai, introduction" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_free" defaultChecked className="size-4 accent-primary" />
          Free course
        </label>
        <Field label="Fee in naira" name="price_naira" placeholder="0" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="coming_soon" className="size-4 accent-primary" />
          Coming soon preview
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="certificate_enabled" defaultChecked className="size-4 accent-primary" />
          Certificate of completion when requirements are met
        </label>
        <Button type="submit">Save draft</Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} placeholder={placeholder} />
    </div>
  );
}
