import { createClient } from "@/lib/supabase/client";

export interface CreateCourseEnrollmentDto {
  course_id: string;
  student_id: string;
  status?: "ACTIVE" | "COMPLETED" | "DROPPED" | "BLOCKED";
}

export class CourseEnrollmentRepository {
  async getStudents(courseId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course_enrollments")
      .select(`
        *,
        profiles(
          id,
          student_code,
          full_name,
          email
        )
      `)
      .eq("course_id", courseId)
      .order("created_at");

    if (error) throw error;

    return data;
  }

  async getCourses(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course_enrollments")
      .select(`
        *,
        courses(*)
      `)
      .eq("student_id", studentId);

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async enroll(values: CreateCourseEnrollmentDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course_enrollments")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateStatus(
    id: string,
    status: CreateCourseEnrollmentDto["status"]
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course_enrollments")
      .update({
        status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async complete(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course_enrollments")
      .update({
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async remove(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("course_enrollments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const courseEnrollmentRepository =
  new CourseEnrollmentRepository();