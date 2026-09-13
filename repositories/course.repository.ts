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

      // HỌC SINH: Dùng Query trực tiếp bằng INNER JOIN/Filter tối ưu Postgres Plan
      if (studentId) {
        const { data, error } = await supabase
          .from("course_students")
          .select(`
            courses!inner (
              id,
              name,
              description,
              thumbnail_url,
              is_active,
              deleted_at,
              created_at,
              updated_at
            )
          `)
          .eq("student_id", studentId)
          .eq("courses.is_active", true)
          .is("courses.deleted_at", null);

        if (error) throw error;

        // Flatten dữ liệu từ Relation
        return (data ?? []).map((item: any) => {
          const course = item.courses;
          return {
            ...course,
            title: course.name,
            thumbnail: course.thumbnail_url,
            category: "",
            teacher: "",
            progress: 0,
            totalLessons: 0,
            chapters: [],
          };
        });
      }

      // GIÁO VIÊN: Lấy toàn bộ khóa học chưa bị xóa
      const { data, error } = await supabase
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
        .order("created_at", { ascending: true });

      if (error) throw error;

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
      console.error("CourseRepository.getAll()", err);
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

  async update(id: string, values: Partial<CreateCourseDto>) {
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

export const courseRepository = new CourseRepository();

export type CourseEntity = Awaited<ReturnType<CourseRepository["getById"]>>;