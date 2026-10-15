import Link from "next/link";
import { notFound } from "next/navigation";
import { useId } from "react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QueryBanner } from "@/components/courses/query-banner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addAssessment,
  addLesson,
  addModule,
  addQuestion,
  addResource,
  setCourseStatus,
  updateCourse,
  updateLesson,
} from "@/app/admin/courses/actions";
import { readQueryMessage } from "@/lib/courses/form";
import {
  COURSE_PILLAR_LABELS,
  COURSE_STATUS_LABELS,
  DELIVERY_LABELS,
  LESSON_TYPE_LABELS,
} from "@/lib/courses/labels";
import {
  getAdminAssessments,
  getAdminCourse,
} from "@/lib/courses/queries";
import type { CourseLesson, CourseModule, CourseStatus, LessonResource } from "@/lib/courses/types";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Edit short course",
  description: "Edit an ACTI short course, its lessons, and its checks.",
  path: "/admin/courses",
  index: false,
});

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireProfile(["admin"]);
  const { id } = await params;
  const query = await searchParams;
  const course = await getAdminCourse(id);
  if (!course) notFound();

  const supabase = await createClient();
  const [{ data: moduleRows }, { data: lessonRows }, assessmentBundle, { data: enrolmentRows }] =
    await Promise.all([
      supabase.from("course_modules").select("*").eq("course_id", course.id).order("sort_order"),
      supabase.from("course_lessons").select("*").eq("course_id", course.id).order("sort_order"),
      getAdminAssessments(course.id),
      supabase
        .from("course_enrolments")
        .select("id, status, enrolled_at, completed_at, user_id")
        .eq("course_id", course.id)
        .order("enrolled_at", { ascending: false })
        .limit(30),
    ]);

  const modules = (moduleRows ?? []) as CourseModule[];
  const lessons = (lessonRows ?? []) as CourseLesson[];
  const lessonIds = lessons.map((lesson) => lesson.id);
  const { data: resourceRows } = lessonIds.length
    ? await supabase.from("lesson_resources").select("*").in("lesson_id", lessonIds)
    : { data: [] };
  const resources = (resourceRows ?? []) as LessonResource[];
  const enrolmentList = (enrolmentRows ?? []) as {
    id: string;
    status: string;
    enrolled_at: string;
    user_id: string;
  }[];
  const learnerIds = enrolmentList.map((row) => row.user_id);
  const { data: learnerRows } = learnerIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", learnerIds)
    : { data: [] };
  const learners = new Map(
    ((learnerRows ?? []) as { id: string; full_name: string; email: string }[]).map((row) => [
      row.id,
      row.full_name || row.email,
    ]),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{course.code}</p>
          <h1 className="font-display text-3xl font-bold text-primary">{course.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Status: {COURSE_STATUS_LABELS[course.publication_status]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.publication_status === "published" && (
            <Link href={`/short-courses/${course.slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
              View catalogue
            </Link>
          )}
          <Link href={`/learn/${course.slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
            Preview lessons
          </Link>
        </div>
      </div>
      <QueryBanner error={readQueryMessage(query.error)} notice={readQueryMessage(query.notice)} />

      <section className="flex flex-wrap gap-2">
        {(["draft", "in_review", "published", "archived"] as CourseStatus[]).map((status) => (
          <form key={status} action={setCourseStatus}>
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="status" value={status} />
            <Button
              type="submit"
              variant={course.publication_status === status ? "default" : "outline"}
              disabled={course.publication_status === status}
            >
              {COURSE_STATUS_LABELS[status]}
            </Button>
          </form>
        ))}
      </section>

      <form action={updateCourse} className="space-y-4 rounded-xl border bg-white/80 p-5">
        <h2 className="font-display text-xl font-semibold">Course details</h2>
        <input type="hidden" name="courseId" value={course.id} />
        <Field label="Title" name="title" defaultValue={course.title} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" name="code" defaultValue={course.code} required />
          <Field label="Slug" name="slug" defaultValue={course.slug} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Pillar</span>
            <select name="pillar" defaultValue={course.pillar} className={selectClass}>
              {Object.entries(COURSE_PILLAR_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Delivery</span>
            <select name="delivery" defaultValue={course.delivery_format} className={selectClass}>
              {Object.entries(DELIVERY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Summary</span>
          <Textarea name="summary" rows={3} defaultValue={course.summary} />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Description</span>
          <Textarea name="description" rows={6} defaultValue={course.description} />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Learning outcomes</span>
          <Textarea name="outcomes" rows={4} defaultValue={(course.outcomes ?? []).join("\n")} />
        </label>
        <Field label="Duration" name="duration_label" defaultValue={course.duration_label} />
        <Field label="Audience" name="audience" defaultValue={course.audience} />
        <Field label="Prerequisites" name="prerequisites" defaultValue={course.prerequisites} />
        <Field label="Instructor name" name="instructor_name" defaultValue={course.instructor_name} />
        <label className="space-y-2 text-sm">
          <span className="font-medium">Instructor bio</span>
          <Textarea name="instructor_bio" rows={3} defaultValue={course.instructor_bio} />
        </label>
        <Field label="Keywords" name="keywords" defaultValue={course.keywords} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_free" defaultChecked={course.is_free} className="size-4 accent-primary" />
          Free course
        </label>
        <Field label="Fee in naira" name="price_naira" defaultValue={String(course.price_kobo / 100)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="coming_soon" defaultChecked={course.coming_soon} className="size-4 accent-primary" />
          Coming soon preview
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="certificate_enabled" defaultChecked={course.certificate_enabled} className="size-4 accent-primary" />
          Certificate of completion when requirements are met
        </label>
        <Button type="submit">Save course</Button>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Modules and lessons</h2>
        {modules.map((module) => (
          <div key={module.id} className="space-y-3 rounded-xl border bg-white/80 p-4">
            <h3 className="font-semibold">{module.title}</h3>
            {module.summary && <p className="text-sm text-muted-foreground">{module.summary}</p>}
            {lessons.filter((lesson) => lesson.module_id === module.id).map((lesson) => (
              <details key={lesson.id} className="rounded-lg border p-3">
                <summary className="cursor-pointer font-medium">
                  {lesson.title} · {COURSE_STATUS_LABELS[lesson.publication_status]}
                </summary>
                <form action={updateLesson} className="mt-4 space-y-3">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <Field label="Title" name="title" defaultValue={lesson.title} required />
                  <Field label="Slug" name="slug" defaultValue={lesson.slug} required />
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Type</span>
                    <select name="lesson_type" defaultValue={lesson.lesson_type} className={selectClass}>
                      {Object.entries(LESSON_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Status</span>
                    <select name="publication_status" defaultValue={lesson.publication_status} className={selectClass}>
                      {Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="Summary" name="summary" defaultValue={lesson.summary} />
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Lesson text</span>
                    <Textarea name="body" rows={8} defaultValue={lesson.body} />
                  </label>
                  <Field label="Video URL" name="video_url" defaultValue={lesson.video_url ?? ""} />
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Transcript</span>
                    <Textarea name="transcript" rows={3} defaultValue={lesson.transcript ?? ""} />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Estimated minutes" name="estimated_minutes" defaultValue={String(lesson.estimated_minutes)} />
                    <Field label="Sort order" name="sort_order" defaultValue={String(lesson.sort_order)} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_required" defaultChecked={lesson.is_required} className="size-4 accent-primary" />
                    Required for completion
                  </label>
                  <Button type="submit" variant="outline">Save lesson</Button>
                </form>
                <form action={addResource} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <Field label="Download title" name="title" />
                  <Field label="https link" name="external_url" />
                  <Button type="submit" variant="outline">Add link</Button>
                </form>
                {resources.filter((resource) => resource.lesson_id === lesson.id).length > 0 && (
                  <ul className="mt-3 text-sm text-muted-foreground">
                    {resources
                      .filter((resource) => resource.lesson_id === lesson.id)
                      .map((resource) => (
                        <li key={resource.id}>{resource.title}</li>
                      ))}
                  </ul>
                )}
              </details>
            ))}
            <form action={addLesson} className="grid gap-3 border-t pt-4">
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="moduleId" value={module.id} />
              <p className="text-sm font-medium">Add a lesson</p>
              <Field label="Title" name="title" required />
              <Field label="Slug" name="slug" />
              <label className="space-y-2 text-sm">
                <span className="font-medium">Type</span>
                <select name="lesson_type" defaultValue="text" className={selectClass}>
                  {Object.entries(LESSON_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Status</span>
                <select name="publication_status" defaultValue="draft" className={selectClass}>
                  {Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Lesson text</span>
                <Textarea name="body" rows={5} />
              </label>
              <Field label="Video URL" name="video_url" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_required" defaultChecked className="size-4 accent-primary" />
                Required for completion
              </label>
              <Button type="submit" variant="outline">Add lesson</Button>
            </form>
          </div>
        ))}
        <form action={addModule} className="grid gap-3 rounded-xl border bg-white/80 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <input type="hidden" name="courseId" value={course.id} />
          <Field label="New module title" name="title" required />
          <Button type="submit">Add module</Button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Course checks</h2>
        {assessmentBundle.assessments.map((assessment) => (
          <div key={assessment.id} className="rounded-xl border bg-white/80 p-4">
            <h3 className="font-semibold">{assessment.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pass mark {assessment.pass_mark_percent}% · {assessment.attempt_limit} attempts ·{" "}
              {COURSE_STATUS_LABELS[assessment.publication_status]}
            </p>
            <ul className="mt-3 space-y-3 text-sm">
              {assessmentBundle.questions
                .filter((question) => question.assessment_id === assessment.id)
                .map((question) => (
                  <li key={question.id}>
                    <p className="font-medium">{question.prompt}</p>
                    <ul className="mt-1 list-disc pl-5">
                      {assessmentBundle.options
                        .filter((option) => option.question_id === question.id)
                        .map((option) => (
                          <li key={option.id}>
                            {option.label}
                            {option.is_correct ? " · Correct" : ""}
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
            </ul>
            <form action={addQuestion} className="mt-4 space-y-3 border-t pt-4">
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="assessmentId" value={assessment.id} />
              <label className="space-y-2 text-sm">
                <span className="font-medium">New question</span>
                <Textarea name="prompt" rows={3} required />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Type</span>
                <select name="question_type" defaultValue="multiple_choice" className={selectClass}>
                  <option value="multiple_choice">Multiple choice</option>
                  <option value="true_false">True/false</option>
                </select>
              </label>
              <Field label="Answer 1" name="option1" />
              <Field label="Answer 2" name="option2" />
              <Field label="Answer 3" name="option3" />
              <Field label="Answer 4" name="option4" />
              <label className="space-y-2 text-sm">
                <span className="font-medium">Correct answer</span>
                <select name="correct" defaultValue="1" className={selectClass}>
                  <option value="1">Answer 1</option>
                  <option value="2">Answer 2</option>
                  <option value="3">Answer 3</option>
                  <option value="4">Answer 4</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Feedback after submission</span>
                <Textarea name="explanation" rows={2} />
              </label>
              <Button type="submit" variant="outline">Add question</Button>
            </form>
          </div>
        ))}
        <form action={addAssessment} className="space-y-3 rounded-xl border bg-white/80 p-4">
          <input type="hidden" name="courseId" value={course.id} />
          <Field label="New check title" name="title" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Pass mark %" name="pass_mark_percent" defaultValue="60" />
            <Field label="Attempt limit" name="attempt_limit" defaultValue="3" />
          </div>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Instructions</span>
            <Textarea name="instructions" rows={2} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_required" defaultChecked className="size-4 accent-primary" />
            Required for completion
          </label>
          <Button type="submit" variant="outline">Add check</Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Enrolments</h2>
        {enrolmentList.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No enrolments yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {enrolmentList.map((row) => (
              <li key={row.id} className="rounded-lg border bg-white/80 px-4 py-3">
                {learners.get(row.user_id) || "Learner"} · {row.status} ·{" "}
                {new Date(row.enrolled_at).toLocaleDateString("en-NG")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} defaultValue={defaultValue} required={required} />
    </div>
  );
}
