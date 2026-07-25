import { createClient } from "@/lib/supabase/client";

class StorageService {
  private supabase = createClient();

  async uploadCourseThumbnail(file: File) {
    const ext = file.name.split(".").pop();

    const path = `courses/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await this.supabase.storage
      .from("course-thumbnails")
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;

    const { data } = this.supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async uploadExamPdf(file: File) {
    const ext = file.name.split(".").pop();

    const path = `exams/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await this.supabase.storage
      .from("exam-files")
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;

    const { data } = this.supabase.storage
      .from("exam-files")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async deleteExamPdf(publicUrl: string) {
    const index = publicUrl.indexOf("/exams/");

    if (index === -1) return;

    const path = publicUrl.substring(index + 1);

    await this.supabase.storage
      .from("exam-files")
      .remove([path]);
  }
}

export const storageService = new StorageService();