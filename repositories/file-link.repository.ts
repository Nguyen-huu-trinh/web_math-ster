import { createClient } from "@/lib/supabase/client";

export interface CreateFileLinkDto {
  title: string;
  provider: string;
  url: string;
}

class FileLinkRepository {
  private supabase = createClient();

  async create(values: CreateFileLinkDto) {
    const { data, error } = await this.supabase
      .from("file_links")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateFileLinkDto>
  ) {
    const { data, error } = await this.supabase
      .from("file_links")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from("file_links")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const fileLinkRepository =
  new FileLinkRepository();