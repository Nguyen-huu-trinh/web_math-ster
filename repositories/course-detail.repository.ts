import { createClient } from "@/lib/supabase/client";

export class CourseDetailRepository {
  async get(
    courseId: string,
    studentId?: string
  ) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        chapters (
          *,
          lessons (
            *,
            lesson_contents (
              *,
              file_links (*)
            )
          )
        )
      `)
      .eq("id", courseId)
      .single();

    if (error) throw error;
    if (!data) return null;

    data.chapters =
      (data.chapters ?? []).sort(
        (a: any, b: any) =>
          a.order_index - b.order_index
      );

    for (const chapter of data.chapters) {

      chapter.lessons =
        (chapter.lessons ?? []).sort(
          (a: any, b: any) =>
            a.order_index - b.order_index
        );

      for (const lesson of chapter.lessons) {

        lesson.contents =
          (lesson.lesson_contents ?? []).sort(
            (a: any, b: any) =>
              a.order_index - b.order_index
          );

        delete lesson.lesson_contents;

        lesson.videos =
          lesson.contents.filter(
            (x: any) => x.type === "video"
          );

        lesson.documents =
          lesson.contents.filter(
            (x: any) => x.type === "document"
          );

        lesson.completed = false;
      }
    }

    if (studentId) {

      const lessonIds =
        data.chapters.flatMap((chapter: any) =>
          chapter.lessons.map(
            (lesson: any) => lesson.id
          )
        );

      if (lessonIds.length) {

        const {
          data: progress,
        } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("student_id", studentId)
          .in("lesson_id", lessonIds);

        for (const chapter of data.chapters) {

          for (const lesson of chapter.lessons) {

            lesson.progress =
              progress?.find(
                (p: any) =>
                  p.lesson_id === lesson.id
              );

            lesson.completed =
              !!lesson.progress?.is_completed;

          }

        }

      }

    }

    const allLessons =
      data.chapters.flatMap(
        (c: any) => c.lessons
      );

    const completed =
      allLessons.filter(
        (l: any) => l.completed
      ).length;

    data.totalLessons =
      allLessons.length;

    data.progress =
      data.totalLessons === 0
        ? 0
        : Math.round(
            completed /
              data.totalLessons *
              100
          );

    data.thumbnail =
      data.thumbnail_url;

    data.teacher = "";

    return data;
  }
}

export const courseDetailRepository =
  new CourseDetailRepository();