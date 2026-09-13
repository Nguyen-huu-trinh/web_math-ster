import { createClient } from "@/lib/supabase/client";

// Định nghĩa kiểu dữ liệu cho Lesson kèm thuộc tính completed
export interface LessonDetail {
  id: string;
  title: string;
  order_index: number;
  is_active: boolean;
  completed?: boolean;
}

export interface ChapterDetail {
  id: string;
  title: string;
  order_index: number;
  lessons: LessonDetail[];
}

export class CourseDetailRepository {
  async get(courseId: string, studentId?: string) {
    const supabase = createClient();

    const { data: course, error } = await supabase
      .from("courses")
      .select(`
        id,
        name,
        description,
        thumbnail_url,
        is_active,
        chapters (
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            order_index,
            is_active
          )
        )
      `)
      .eq("id", courseId)
      .order("order_index", { referencedTable: "chapters", ascending: true })
      .order("order_index", { referencedTable: "chapters.lessons", ascending: true })
      .single();

    if (error) throw error;
    if (!course) return null;

    // Ep kiểu dữ liệu cho chapters để TypeScript nhận diện thuộc tính completed
    const chapters = (course.chapters ?? []) as unknown as ChapterDetail[];
    const allLessons = chapters.flatMap((chapter) => chapter.lessons ?? []);
    const totalLessons = allLessons.length;

    let completedCount = 0;

    if (studentId && totalLessons > 0) {
      const lessonIds = allLessons.map((lesson) => lesson.id);

      const { data: progressList } = await supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed")
        .eq("student_id", studentId)
        .in("lesson_id", lessonIds);

      const progressMap = new Map<string, boolean>(
        progressList?.map((p: any) => [p.lesson_id, p.is_completed]) ?? []
      );

      for (const chapter of chapters) {
        for (const lesson of chapter.lessons ?? []) {
          const isCompleted = progressMap.get(lesson.id) ?? false;
          lesson.completed = isCompleted; // TypeScript không còn báo lỗi tại đây
          if (isCompleted) completedCount++;
        }
      }
    } else {
      for (const chapter of chapters) {
        for (const lesson of chapter.lessons ?? []) {
          lesson.completed = false; // TypeScript không còn báo lỗi tại đây
        }
      }
    }

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      is_active: course.is_active,
      chapters,
      totalLessons,
      progress: totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100),
      teacher: "",
    };
  }
}

export const courseDetailRepository = new CourseDetailRepository();