import { createClient } from "@/lib/supabase/client";

export interface CreateDocumentDto {
  lesson_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  file_type: string;
  document_order: number;
}

export class DocumentRepository {
  async getByLesson(lessonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_documents")
      .select("*")
      .eq("lesson_id", lessonId)
      .is("deleted_at", null)
      .order("document_order");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateDocumentDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_documents")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateDocumentDto>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_documents")
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
      .from("lesson_documents")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }
}

export const documentRepository =
  new DocumentRepository();