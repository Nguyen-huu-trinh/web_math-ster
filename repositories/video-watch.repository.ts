import { createClient } from "@/lib/supabase/client";

export interface UpdateVideoWatchDto {
  student_id: string;
  video_id: string;

  current_second: number;
  watched_seconds: number;
  completed?: boolean;
}

export class VideoWatchRepository {
  async getStudentVideos(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("video_watch_history")
      .select(`
        *,
        lesson_videos(
          id,
          title,
          duration_seconds,
          lesson_id
        )
      `)
      .eq("student_id", studentId);

    if (error) throw error;

    return data;
  }

  async getVideoProgress(
    studentId: string,
    videoId: string
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("video_watch_history")
      .select("*")
      .eq("student_id", studentId)
      .eq("video_id", videoId)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  async save(values: UpdateVideoWatchDto) {
    const supabase = await createClient();

    const current = await this.getVideoProgress(
      values.student_id,
      values.video_id
    );

    if (current) {
      const { data, error } = await supabase
        .from("video_watch_history")
        .update({
          current_second: values.current_second,
          watched_seconds: values.watched_seconds,
          completed: values.completed,
          last_watched_at: new Date().toISOString(),
        })
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    }

    const { data, error } = await supabase
      .from("video_watch_history")
      .insert({
        ...values,
        last_watched_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async complete(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("video_watch_history")
      .update({
        completed: true,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const videoWatchRepository =
  new VideoWatchRepository();