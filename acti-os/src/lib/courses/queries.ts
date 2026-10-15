import { createClient } from "@/lib/supabase/server";
import type {
  AssessmentAttempt,
  AssessmentOutline,
  CourseAssessment,
  CourseCardData,
  CourseEnrolment,
  CourseLesson,
  CourseModule,
  LessonOutline,
  LessonProgress,
  LessonResource,
  ShortCourse,
} from "@/lib/courses/types";

export async function getPublishedCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("short_courses")
    .select(
      "id, code, slug, title, pillar, summary, duration_label, price_kobo, is_free, delivery_format, cover_image_url, publication_status, coming_soon, keywords",
    )
    .eq("publication_status", "published")
    .order("title");

  return {
    courses: (data ?? []) as CourseCardData[],
    error: error?.message ?? null,
  };
}

export async function getCourseBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("short_courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return {
    course: (data as ShortCourse | null) ?? null,
    error: error?.message ?? null,
  };
}

export async function getPublishedOutlines(courseId: string) {
  const supabase = await createClient();
  const [{ data: lessons, error: lessonError }, { data: assessments, error: assessmentError }] =
    await Promise.all([
      supabase
        .from("published_lesson_outlines")
        .select("*")
        .eq("course_id", courseId),
      supabase
        .from("published_assessment_outlines")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order"),
    ]);

  return {
    lessons: (lessons ?? []) as LessonOutline[],
    assessments: (assessments ?? []) as AssessmentOutline[],
    error: lessonError?.message ?? assessmentError?.message ?? null,
  };
}

export async function getEnrolment(userId: string, courseId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_enrolments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  return (data as CourseEnrolment | null) ?? null;
}

export async function getReadableCourseTree(courseId: string) {
  const supabase = await createClient();
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order"),
    supabase
      .from("course_lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order"),
  ]);

  const moduleRows = (modules ?? []) as CourseModule[];
  const lessonRows = (lessons ?? []) as CourseLesson[];
  const moduleById = new Map(moduleRows.map((module) => [module.id, module]));

  const outlines: LessonOutline[] = lessonRows
    .filter((lesson) => lesson.publication_status === "published" || moduleById.has(lesson.module_id))
    .map((lesson) => {
      const parent = moduleById.get(lesson.module_id);
      return {
        id: lesson.id,
        course_id: lesson.course_id,
        module_id: lesson.module_id,
        module_title: parent?.title ?? "Module",
        module_sort: parent?.sort_order ?? lesson.sort_order,
        title: lesson.title,
        slug: lesson.slug,
        summary: lesson.summary,
        lesson_type: lesson.lesson_type,
        estimated_minutes: lesson.estimated_minutes,
        is_required: lesson.is_required,
        sort_order: lesson.sort_order,
      };
    });

  return { modules: moduleRows, lessons: lessonRows, outlines };
}

export async function getLessonResources(lessonId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_resources")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order");

  return (data ?? []) as LessonResource[];
}

export async function getLessonProgress(enrolmentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("enrolment_id", enrolmentId);

  return (data ?? []) as LessonProgress[];
}

export async function getAttempts(enrolmentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessment_attempts")
    .select("*")
    .eq("enrolment_id", enrolmentId)
    .order("submitted_at", { ascending: false });

  return (data ?? []) as AssessmentAttempt[];
}

export async function getAdminCourse(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("short_courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as ShortCourse | null) ?? null;
}

export async function getAdminAssessments(courseId: string) {
  const supabase = await createClient();
  const { data: assessments } = await supabase
    .from("course_assessments")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order");

  const rows = (assessments ?? []) as CourseAssessment[];
  if (!rows.length) return { assessments: rows, questions: [], options: [] };

  const { data: questions } = await supabase
    .from("assessment_questions")
    .select("*")
    .in(
      "assessment_id",
      rows.map((row) => row.id),
    )
    .order("sort_order");

  const questionRows = (questions ?? []) as {
    id: string;
    assessment_id: string;
    prompt: string;
    question_type: string;
    explanation: string | null;
    sort_order: number;
  }[];

  const { data: options } = questionRows.length
    ? await supabase
        .from("assessment_options")
        .select("*")
        .in(
          "question_id",
          questionRows.map((question) => question.id),
        )
        .order("sort_order")
    : { data: [] };

  return {
    assessments: rows,
    questions: questionRows,
    options: (options ?? []) as {
      id: string;
      question_id: string;
      label: string;
      is_correct: boolean;
      sort_order: number;
    }[],
  };
}
