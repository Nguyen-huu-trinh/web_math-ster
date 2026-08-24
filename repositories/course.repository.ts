import { createClient } from "@/lib/supabase/server";

export interface CreateCourseDto {
  name: string;
  description?: string;
  thumbnail_url?: string;
  is_active?: boolean;
}

export class CourseRepository {
 async getAll(studentId?: string) {
  try {
    const supabase = await createClient();

    // =====================================================
    // HỌC SINH
    // Chỉ lấy những course mà học sinh đã được thêm vào
    // =====================================================

    if (studentId) {
      const {
        data: courseStudents,
        error: courseStudentError,
      } = await supabase
        .from("course_students")
        .select("course_id")
        .eq("student_id", studentId);

      if (courseStudentError) {
        throw courseStudentError;
      }

      const courseIds =
        courseStudents?.map(
          (item) => item.course_id
        ) ?? [];

      // Học sinh chưa được thêm vào khóa học nào
      if (courseIds.length === 0) {
        return [];
      }

      const { data, error } =
        await supabase
          .from("courses")
          .select(`
            id,
            name,
            description,
            thumbnail_url,
            is_active,
            deleted_at,
            created_at,
            updated_at
          `)
          .in("id", courseIds)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("created_at", {
            ascending: true,
          });

      if (error) {
        throw error;
      }

      return (data ?? []).map((course) => ({
        ...course,

        // UI Compatibility
        title: course.name,
        thumbnail: course.thumbnail_url,
        category: "",
        teacher: "",
        progress: 0,
        totalLessons: 0,
        chapters: [],
      }));
    }

    // =====================================================
    // GIÁO VIÊN
    // Không có studentId → lấy toàn bộ khóa học
    // =====================================================

    const { data, error } =
      await supabase
        .from("courses")
        .select(`
          id,
          name,
          description,
          thumbnail_url,
          is_active,
          deleted_at,
          created_at,
          updated_at
        `)
        .is("deleted_at", null)
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      throw error;
    }

    console.log("Supabase data:", data);

    return (data ?? []).map((course) => ({
      ...course,

      title: course.name,
      thumbnail: course.thumbnail_url,
      category: "",
      teacher: "",
      progress: 0,
      totalLessons: 0,
      chapters: [],
    }));
  } catch (err) {
    console.error(
      "CourseRepository.getAll()",
      err
    );

    throw err;
  }
}

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .select("id, name, description, thumbnail_url, is_active, deleted_at, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      ...data,

      // ===== UI Compatibility =====
      title: data.name,
      thumbnail: data.thumbnail_url,
      category: "",
      teacher: "",
      progress: 0,
      totalLessons: 0,
      chapters: [],
    };
  }

  async create(values: CreateCourseDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateCourseDto>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
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
      .from("courses")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .update({
        deleted_at: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const courseRepository =
  new CourseRepository();

export type CourseEntity =
  Awaited<
    ReturnType<
      CourseRepository["getById"]
    >
  >;
