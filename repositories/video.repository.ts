import { createClient } from "@/lib/supabase/client";

export interface CreateVideoDto {
  lesson_id: string;
  title: string;
  description?: string;
  provider: "YOUTUBE" | "GOOGLE_DRIVE" | "VIMEO" | "OTHER";
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  video_order: number;
  is_preview?: boolean;
}

export class VideoRepository {
  async getByLesson(lessonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_videos")
      .select("*")
      .eq("lesson_id", lessonId)
      .is("deleted_at", null)
      .order("video_order");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_videos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateVideoDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_videos")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateVideoDto>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_videos")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("lesson_videos")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }
}

export const videoRepository =
  new VideoRepository();