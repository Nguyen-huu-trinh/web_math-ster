import {
  courseRepository,
  type CreateCourseDto,
} from "@/repositories/course.repository";

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class CourseService {
  private courseCache = new Map<string, CacheItem<any>>();
  private readonly TTL_MS = 3 * 60 * 1000; // Cache 3 phút (180s)

  async getAll(studentId?: string) {
    const cacheKey = studentId ? `student_${studentId}` : "teacher_all";
    const now = Date.now();
    const cached = this.courseCache.get(cacheKey);

    // Nếu có Cache và chưa hết hạn -> Trả về ngay lập tức (0ms CPU)
    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const data = await courseRepository.getAll(studentId);

    // Lưu vào Memory Cache
    this.courseCache.set(cacheKey, {
      data,
      expiry: now + this.TTL_MS,
    });

    return data;
  }

  async getById(id: string) {
    const cacheKey = `course_detail_${id}`;
    const now = Date.now();
    const cached = this.courseCache.get(cacheKey);

    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const data = await courseRepository.getById(id);

    if (data) {
      this.courseCache.set(cacheKey, {
        data,
        expiry: now + this.TTL_MS,
      });
    }

    return data;
  }

  async create(data: CreateCourseDto) {
    const result = await courseRepository.create(data);
    this.clearCache(); // Invalidate Cache khi thêm khóa học mới
    return result;
  }

  async update(id: string, data: Partial<CreateCourseDto>) {
    const result = await courseRepository.update(id, data);
    this.clearCache(); // Invalidate Cache khi cập nhật khóa học
    return result;
  }

  async delete(id: string) {
    const result = await courseRepository.delete(id);
    this.clearCache();
    return result;
  }

  async restore(id: string) {
    const result = await courseRepository.restore(id);
    this.clearCache();
    return result;
  }

  // Hàm dọn dẹp Cache khi có thay đổi dữ liệu
  private clearCache() {
    this.courseCache.clear();
  }
}

export const courseService = new CourseService();