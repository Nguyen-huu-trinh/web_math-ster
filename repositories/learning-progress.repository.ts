import { createClient } from "@/lib/supabase/server";

export interface UpdateLearningProgressDto {
  student_id: string;
  lesson_id: string;

  progress_percent: number;

  watched_seconds?: number;

  study_seconds?: number;

  completed?: boolean;
}

export class LearningProgressRepository {
  async getStudentProgress(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("learning_progress")
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
          .from("learning_progress")
          .select("*")
          .eq("student_id", studentId)
          .eq("lesson_id", lessonId)
          .maybeSingle();

      if (error) throw error;

      return data;
  }

  async save(values: UpdateLearningProgressDto) {
      const supabase = await createClient();

      const current = await this.getLessonProgress(
          values.student_id,
          values.lesson_id
      );

      if (current) {

          const { data, error } = await supabase
              .from("learning_progress")
              .update({
                  progress_percent: values.progress_percent,
                  watched_seconds: values.watched_seconds,
                  study_seconds: values.study_seconds,
                  completed: values.completed,
                  last_studied_at: new Date().toISOString(),
              })
              .eq("id", current.id)
              .select()
              .single();

          if (error) throw error;

          return data;
      }

      const { data, error } = await supabase
          .from("learning_progress")
          .insert({
              ...values,
              last_studied_at: new Date().toISOString(),
          })
          .select()
          .single();

      if (error) throw error;

      return data;
  }

  async complete(id: string) {

      const supabase = await createClient();

      const { data, error } = await supabase
          .from("learning_progress")
          .update({
              completed: true,
              progress_percent: 100,
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