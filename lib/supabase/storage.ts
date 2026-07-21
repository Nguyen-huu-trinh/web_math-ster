import { createClient } from "@/lib/supabase/server";

export class StorageService {
  async upload(
    bucket: string,
    path: string,
    file: File
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) throw error;

    return data;
  }

  async remove(
    bucket: string,
    path: string
  ) {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  async getPublicUrl(
    bucket: string,
    path: string
  ) {
    const supabase = await createClient();

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async createSignedUrl(
    bucket: string,
    path: string,
    expires = 3600
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expires);

    if (error) throw error;

    return data.signedUrl;
  }
}

export const storageService =
  new StorageService();