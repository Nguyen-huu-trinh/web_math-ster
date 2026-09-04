import { createClient } from "@/lib/supabase/client";

class StorageService {
  private supabase = createClient();

  private async compressCourseThumbnail(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Thumbnail phải là file hình ảnh.");
    }

    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Không thể đọc file hình ảnh."));
        image.src = imageUrl;
      });

      const maxWidth = 1280;
      const maxHeight = 720;

      const scale = Math.min(
        1,
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight,
      );

      const width = Math.round(image.naturalWidth * scale);
      const height = Math.round(image.naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Không thể tạo canvas để nén hình ảnh.");
      }

      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.8);
      });

      if (!blob) {
        throw new Error("Không thể nén thumbnail.");
      }

      return new File(
        [blob],
        `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
        {
          type: "image/webp",
        },
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async uploadCourseThumbnail(file: File) {
    const compressedFile = await this.compressCourseThumbnail(file);

    const path = `courses/${Date.now()}-${crypto.randomUUID()}.webp`;

    const { error } = await this.supabase.storage
      .from("course-thumbnails")
      .upload(path, compressedFile, {
        upsert: true,
        cacheControl: "31536000",
        contentType: "image/webp",
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