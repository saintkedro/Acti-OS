import type { ProgrammePillar } from "@/lib/types";

export type CourseStatus = "draft" | "in_review" | "published" | "archived";
export type CourseDelivery = "online" | "physical" | "hybrid";
export type LessonType =
  | "text"
  | "video"
  | "text_video"
  | "presentation"
  | "practical"
  | "external_resource";
export type EnrolmentStatus = "active" | "completed" | "withdrawn";
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "multiple_select"
  | "short_answer";

export type ShortCourse = {
  id: string;
  code: string;
  slug: string;
  title: string;
  pillar: ProgrammePillar;
  summary: string;
  description: string;
  outcomes: string[] | null;
  audience: string;
  prerequisites: string;
  duration_label: string;
  estimated_minutes: number;
  price_kobo: number;
  currency: string;
  is_free: boolean;
  delivery_format: CourseDelivery;
  cover_image_url: string | null;
  intro_video_url: string | null;
  instructor_name: string;
  instructor_bio: string;
  keywords: string;
  publication_status: CourseStatus;
  coming_soon: boolean;
  certificate_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseCardData = Pick<
  ShortCourse,
  | "id"
  | "code"
  | "slug"
  | "title"
  | "pillar"
  | "summary"
  | "duration_label"
  | "price_kobo"
  | "is_free"
  | "delivery_format"
  | "cover_image_url"
  | "publication_status"
  | "coming_soon"
  | "keywords"
>;

export type LessonOutline = {
  id: string;
  course_id: string;
  module_id: string;
  module_title: string;
  module_sort: number;
  title: string;
  slug: string;
  summary: string;
  lesson_type: LessonType;
  estimated_minutes: number;
  is_required: boolean;
  sort_order: number;
};

export type CourseLesson = {
  id: string;
  course_id: string;
  module_id: string;
  slug: string;
  title: string;
  summary: string;
  lesson_type: LessonType;
  body: string;
  video_url: string | null;
  video_duration_seconds: number | null;
  poster_url: string | null;
  caption_url: string | null;
  transcript: string | null;
  estimated_minutes: number;
  is_required: boolean;
  sort_order: number;
  publication_status: CourseStatus;
};

export type LessonResource = {
  id: string;
  lesson_id: string;
  title: string;
  external_url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  sort_order: number;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  summary: string;
  sort_order: number;
};

export type AssessmentOutline = {
  id: string;
  course_id: string;
  title: string;
  is_required: boolean;
  pass_mark_percent: number;
  attempt_limit: number;
  sort_order: number;
};

export type CourseAssessment = AssessmentOutline & {
  module_id: string | null;
  instructions: string;
  publication_status: CourseStatus;
};

export type CourseCertificate = {
  id: string;
  code: string;
  learner_name: string;
  course_title: string;
  issued_at: string;
};

export type CourseEnrolment = {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrolmentStatus;
  enrolled_at: string;
  completed_at: string | null;
  last_lesson_id: string | null;
  last_accessed_at: string | null;
};

export type LessonProgress = {
  id: string;
  enrolment_id: string;
  lesson_id: string;
  completed_at: string;
};

export type AssessmentAttempt = {
  id: string;
  enrolment_id: string;
  assessment_id: string;
  score_percent: number;
  passed: boolean;
  attempt_number: number;
  submitted_at: string;
};

export type LearnerOption = { id: string; label: string };

export type LearnerQuestion = {
  id: string;
  prompt: string;
  question_type: QuestionType;
  options: LearnerOption[];
};

export type LearnerAssessment = {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  pass_mark_percent: number;
  attempt_limit: number;
  attempts_used: number;
  questions: LearnerQuestion[];
};

export type AttemptFeedback = {
  question_id: string;
  prompt: string;
  selected_label: string;
  correct: boolean;
  feedback: string;
};
