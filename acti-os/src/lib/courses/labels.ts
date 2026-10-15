import { formatNaira } from "@/lib/money";
import type { ProgrammePillar } from "@/lib/types";
import type { CourseDelivery, CourseStatus, LessonType } from "@/lib/courses/types";

export const COURSE_PILLAR_LABELS: Record<ProgrammePillar, string> = {
  technology: "Technology & Digital",
  technical_vocational: "Technical & Vocational",
  innovation_entrepreneurship: "Innovation & Entrepreneurship",
};

export const DELIVERY_LABELS: Record<CourseDelivery, string> = {
  online: "Online",
  physical: "Physical",
  hybrid: "Hybrid",
};

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  text: "Text",
  video: "Video",
  text_video: "Text and video",
  presentation: "Presentation",
  practical: "Practical",
  external_resource: "External resource",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  archived: "Archived",
};

export const LESSON_TYPES = Object.keys(LESSON_TYPE_LABELS) as LessonType[];
export const COURSE_STATUSES = Object.keys(COURSE_STATUS_LABELS) as CourseStatus[];
export const DELIVERIES = Object.keys(DELIVERY_LABELS) as CourseDelivery[];

export function priceLabel(course: { is_free: boolean; price_kobo: number }) {
  if (course.is_free) return "Free";
  if (course.price_kobo > 0) return formatNaira(course.price_kobo);
  return "Paid";
}

export function showsVideoSlot(type: LessonType) {
  return (
    type === "video" ||
    type === "text_video" ||
    type === "presentation" ||
    type === "practical"
  );
}
