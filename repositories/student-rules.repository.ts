import { adminClient } from "@/lib/supabase/admin";

export class StudentRulesRepository {
  async getAll() {
    const { data, error } = await adminClient
      .from("student_rules")
      .select(
        "id, title, content, display_order"
      )
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "[STUDENT RULES REPOSITORY] GET ALL ERROR:",
        error
      );

      throw new Error(
        "Không thể lấy danh sách nội quy."
      );
    }

    return data ?? [];
  }

  async create(data: {
  title: string;
  content: string;
}) {
  const { data: maxOrderData, error: maxOrderError } =
    await adminClient
      .from("student_rules")
      .select("display_order")
      .order("display_order", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (maxOrderError) {
    console.error(
      "[STUDENT RULES REPOSITORY] GET MAX ORDER ERROR:",
      maxOrderError
    );

    throw new Error(
      "Không thể xác định thứ tự nội quy."
    );
  }

  const nextOrder =
    (maxOrderData?.display_order ?? 0) + 1;

  const { data: rule, error } =
    await adminClient
      .from("student_rules")
      .insert({
        title: data.title,
        content: data.content,
        display_order: nextOrder,
      })
      .select(
        "id, title, content, display_order"
      )
      .single();

  if (error) {
    console.error(
      "[STUDENT RULES REPOSITORY] CREATE ERROR:",
      error
    );

    throw new Error(
      "Không thể thêm nội quy."
    );
  }

  return rule;
}

async update(
  id: string,
  data: {
    title: string;
    content: string;
  }
) {
  const {
    data: rule,
    error,
  } = await adminClient
    .from("student_rules")
    .update({
      title: data.title,
      content: data.content,
    })
    .eq("id", id)
    .select(
      "id, title, content, display_order"
    )
    .single();

  if (error) {
    console.error(
      "[STUDENT RULES REPOSITORY] UPDATE ERROR:",
      error
    );

    throw new Error(
      "Không thể cập nhật nội quy."
    );
  }

  return rule;
}

async remove(id: string) {
  const { error } =
    await adminClient
      .from("student_rules")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "[STUDENT RULES REPOSITORY] DELETE ERROR:",
      error
    );

    throw new Error(
      "Không thể xóa nội quy."
    );
  }

  return true;
}

}

export const studentRulesRepository =
  new StudentRulesRepository();