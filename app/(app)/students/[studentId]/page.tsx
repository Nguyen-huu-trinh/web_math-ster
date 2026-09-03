import {
    TeacherStudentDetailPage,
} from "@/components/teachers/students/teacher-student-detail";

interface Props {
    params: Promise<{
        studentId: string;
    }>;
    searchParams: Promise<{
        courseId?: string;
    }>;
}

export default async function Page({
    params,
    searchParams,
}: Props) {
    const { studentId } =
        await params;

    const { courseId } =
        await searchParams;

    return (
        <TeacherStudentDetailPage
            studentId={studentId}
            courseId={courseId}
        />
    );
}