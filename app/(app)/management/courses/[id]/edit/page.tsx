import { notFound } from "next/navigation";

import CourseForm from "@/components/courses/course-form";

import { courseService } from "@/services/course.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCoursePage({
  params,
}: Props) {
  const { id } = await params;

  const course =
    await courseService.getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          Chỉnh sửa khóa học

        </h1>

      </div>

      <CourseForm
        course={course}
      />

    </div>
  );
}