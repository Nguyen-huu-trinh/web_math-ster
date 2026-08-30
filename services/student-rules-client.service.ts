export interface StudentRule {
  id: string;
  title: string;
  content: string;
  display_order: number;
}

interface StudentRulesResponse {
  success: boolean;
  data: StudentRule[];
}

interface StudentRuleResponse {
  success: boolean;
  data: StudentRule;
  message?: string;
}

class StudentRulesClientService {
  async getAll(): Promise<StudentRule[]> {
    const response = await fetch(
      "/api/student-rules",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const result =
      (await response.json()) as
        | StudentRulesResponse
        | { message?: string };

    if (!response.ok) {
      throw new Error(
        "message" in result && result.message
          ? result.message
          : "Không thể lấy danh sách nội quy."
      );
    }

    return "data" in result
      ? result.data
      : [];
  }

async create(data: {
  title: string;
  content: string;
}): Promise<StudentRule> {
  const response = await fetch(
    "/api/student-rules",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Không thể thêm nội quy."
    );
  }

  if (!result?.data) {
    throw new Error(
      "API không trả về dữ liệu nội quy."
    );
  }

  return result.data as StudentRule;
}

async update(
  id: string,
  data: {
    title: string;
    content: string;
  }
): Promise<StudentRule> {
  const response = await fetch(
    `/api/student-rules/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Không thể cập nhật nội quy."
    );
  }

  if (!result?.data) {
    throw new Error(
      "API không trả về dữ liệu nội quy."
    );
  }

  return result.data as StudentRule;
}

async remove(
  id: string
): Promise<void> {
  const response = await fetch(
    `/api/student-rules/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Không thể xóa nội quy."
    );
  }
}
}

export const studentRulesClientService =
  new StudentRulesClientService();