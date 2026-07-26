import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
export interface CreateProfileInput {
  id: string;
  student_code: string;
  full_name: string;
  personal_email: string;
  email: string;
}

export class AccountRepository {

  // ===========================================
  // CREATE PROFILE
  // ===========================================

 async updateProfile(
    id: string,
    values: {
      student_code: string;
      full_name: string;
      personal_email: string;
    }
  ) {
    const { error } = await adminClient
      .from("profiles")
      .update({
        student_code: values.student_code,
        full_name: values.full_name,
        personal_email: values.personal_email,
      })
      .eq("id", id);

    if (error) throw error;
  }

  async enrollCourses(
    studentId: string,
    courseIds: string[]
  ) {
    if (courseIds.length === 0) return;

    const rows = courseIds.map((courseId) => ({
      student_id: studentId,
      course_id: courseId,
    }));

    const { error } = await adminClient
      .from("course_students")
      .insert(rows);

    if (error) throw error;
  }
}


export const accountRepository =
  new AccountRepository();