export interface CreateStudentPayload {
  student_code: string;
  full_name: string;
  personal_email: string;
  course_ids: string[];
}

export interface CreateStudentResult {
  email: string;
  password: string;
}

export interface ImportStudentsResult {
  success: number;
  failed: number;
}

class AccountClientService {
  async createStudent(payload: CreateStudentPayload) {
    const response = await fetch("/api/accounts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message ?? "CÃ³ lá»—i xáº£y ra.");
    return result as CreateStudentResult;
  }

  async importStudents(file: File, courseIds: string[]) {
    const formData = new FormData();
    formData.append("file", file);
    courseIds.forEach((id) => formData.append("courseIds", id));

    const response = await fetch("/api/accounts/import", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result as ImportStudentsResult;
  }
}

export const accountClientService = new AccountClientService();
