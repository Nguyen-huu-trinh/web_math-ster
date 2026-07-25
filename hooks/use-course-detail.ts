import { useEffect, useState } from "react";

import { getCourseDetail } from "@/lib/api/course";

import { CourseDetail } from "@/types/course-detail";

export function useCourseDetail(
  courseId: string
) {
  const [course, setCourse] =
    useState<CourseDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getCourseDetail(courseId)
      .then(setCourse)
      .finally(() => setLoading(false));
  }, [courseId]);

  return {
    course,
    loading,
  };
}