import { createClient } from "@/lib/supabase/client";

export interface UpdateLearningProgressDto {
    student_id: string;
    lesson_id: string;
    is_completed: boolean;
}
export class LearningProgressRepository {
  async getStudentProgress(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
       .from("lesson_progress")
        .select(`
            *,
            lessons(
                id,
                title,
                chapter_id
            )
        `)
        .eq("student_id", studentId);

    if (error) throw error;

    return data;
  }

  async getLessonProgress(
      studentId: string,
      lessonId: string
  ) {
      const supabase = await createClient();

      const { data, error } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("student_id", studentId)
          .eq("lesson_id", lessonId)
          .maybeSingle();

      if (error) throw error;

      return data;
  }

  async save(values: UpdateLearningProgressDto) {

    const supabase = await createClient();

    const current =
        await this.getLessonProgress(
            values.student_id,
            values.lesson_id
        );

    if (current) {

        const { data, error } =
            await supabase
                .from("lesson_progress")
                .update({
                    is_completed: values.is_completed,
                    completed_at: values.is_completed
                        ? new Date().toISOString()
                        : null,
                })
                .eq("id", current.id)
                .select()
                .single();

        if (error) throw error;

        return data;
    }

    const { data, error } =
        await supabase
            .from("lesson_progress")
            .insert({
                student_id: values.student_id,
                lesson_id: values.lesson_id,
                is_completed: values.is_completed,
                completed_at: values.is_completed
                    ? new Date().toISOString()
                    : null,
            })
            .select()
            .single();

    if (error) throw error;

    return data;
}

  async complete(id: string) {

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("lesson_progress")
        .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
}
}

export const learningProgressRepository =
    new LearningProgressRepository();