import type { AssessmentOutline, LessonOutline } from "@/lib/courses/types";

export function orderLessons(lessons: LessonOutline[]) {
  return [...lessons].sort(
    (a, b) =>
      a.module_sort - b.module_sort ||
      a.sort_order - b.sort_order ||
      a.title.localeCompare(b.title),
  );
}

export function groupLessons(lessons: LessonOutline[]) {
  const groups = new Map<
    string,
    { id: string; title: string; sort: number; lessons: LessonOutline[] }
  >();

  for (const lesson of orderLessons(lessons)) {
    const current = groups.get(lesson.module_id) ?? {
      id: lesson.module_id,
      title: lesson.module_title,
      sort: lesson.module_sort,
      lessons: [],
    };
    current.lessons.push(lesson);
    groups.set(lesson.module_id, current);
  }

  return [...groups.values()].sort((a, b) => a.sort - b.sort);
}

export function completionSummary(
  lessons: LessonOutline[],
  assessments: Pick<AssessmentOutline, "id" | "is_required">[],
  completedLessonIds: Set<string>,
  passedAssessmentIds: Set<string>,
) {
  const requiredLessons = lessons.filter((lesson) => lesson.is_required);
  const requiredAssessments = assessments.filter((item) => item.is_required);
  const total = requiredLessons.length + requiredAssessments.length;
  const done =
    requiredLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length +
    requiredAssessments.filter((item) => passedAssessmentIds.has(item.id)).length;

  return {
    total,
    done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    complete: total > 0 && done === total,
  };
}

export function continueTarget(input: {
  courseSlug: string;
  lessons: LessonOutline[];
  completedLessonIds: Set<string>;
  lastLessonId: string | null;
  assessments: Pick<AssessmentOutline, "id" | "title" | "is_required">[];
  passedAssessmentIds: Set<string>;
}) {
  const ordered = orderLessons(input.lessons);
  const last = ordered.find((lesson) => lesson.id === input.lastLessonId);
  if (last && !input.completedLessonIds.has(last.id)) {
    return {
      href: `/learn/${input.courseSlug}/lessons/${last.slug}`,
      label: `Continue: ${last.title}`,
    };
  }

  const nextLesson =
    ordered.find(
      (lesson) => lesson.is_required && !input.completedLessonIds.has(lesson.id),
    ) ?? ordered.find((lesson) => !input.completedLessonIds.has(lesson.id));

  if (nextLesson) {
    return {
      href: `/learn/${input.courseSlug}/lessons/${nextLesson.slug}`,
      label: `Continue: ${nextLesson.title}`,
    };
  }

  const quiz = input.assessments.find(
    (item) => item.is_required && !input.passedAssessmentIds.has(item.id),
  );
  if (quiz) {
    return {
      href: `/learn/${input.courseSlug}/assessments/${quiz.id}`,
      label: `Continue: ${quiz.title}`,
    };
  }

  return {
    href: `/learn/${input.courseSlug}`,
    label: "Review course",
  };
}
