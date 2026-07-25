import { useEffect, useState } from "react";
import { getLesson } from "@/lib/api/course";

export function useLesson(
  lessonId: string
) {
  const [lesson, setLesson] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getLesson(lessonId)
      .then(setLesson)
      .finally(() => setLoading(false));
  }, [lessonId]);

  return {
    lesson,
    loading,
  };
}