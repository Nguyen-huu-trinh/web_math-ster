import { createClient } from "@/lib/supabase/client";

export class CourseDetailRepository {
  async get(courseId: string, studentId?: string) {
    const supabase = createClient();

    // Giữ nguyên câu query gốc lấy trọn vẹn dữ liệu
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

    // Sắp xếp chapters theo order_index
    data.chapters = (data.chapters ?? []).sort(
      (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    const allLessonIds: string[] = [];

    for (const chapter of data.chapters) {
      chapter.lessons = (chapter.lessons ?? []).sort(
        (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );

      for (const lesson of chapter.lessons) {
        // Giữ nguyên logic map contents & filter x.type chuẩn theo DB gốc
        lesson.contents = (lesson.lesson_contents ?? []).sort(
          (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
        );

        delete lesson.lesson_contents;

        lesson.videos = lesson.contents.filter(
          (x: any) => x.type === "video"
        );

        lesson.documents = lesson.contents.filter(
          (x: any) => x.type === "document"
        );

        lesson.completed = false;
        allLessonIds.push(lesson.id);
      }
    }

    // Tối ưu thuật toán tra cứu progress bằng Map (O(1)) thay vì .find() (O(N))
    if (studentId && allLessonIds.length > 0) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("student_id", studentId)
        .in("lesson_id", allLessonIds);

      // Chuyển sang Map để tra cứu tức thì
      const progressMap = new Map(
        progress?.map((p: any) => [p.lesson_id, p]) ?? []
      );

      for (const chapter of data.chapters) {
        for (const lesson of chapter.lessons) {
          lesson.progress = progressMap.get(lesson.id) || null;
          lesson.completed = !!lesson.progress?.is_completed;
        }
      }
    }

    const allLessons = data.chapters.flatMap((c: any) => c.lessons);
    const completed = allLessons.filter((l: any) => l.completed).length;

    data.totalLessons = allLessons.length;
    data.progress =
      data.totalLessons === 0
        ? 0
        : Math.round((completed / data.totalLessons) * 100);

    data.thumbnail = data.thumbnail_url;
    data.teacher = "";

    return data;
  }
}

export const courseDetailRepository = new CourseDetailRepository();