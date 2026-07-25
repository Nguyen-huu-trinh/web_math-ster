import CourseForm from "@/components/courses/course-form";

export default function NewCoursePage() {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          Tạo khóa học

        </h1>

        <p className="text-muted-foreground">

          Thêm khóa học mới

        </p>

      </div>

      <CourseForm />

    </div>
  );
}