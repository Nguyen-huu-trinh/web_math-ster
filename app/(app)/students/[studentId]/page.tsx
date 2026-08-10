import {
    TeacherStudentDetailPage,
} from "@/components/teachers/students/teacher-student-detail";

interface Props {
    params: Promise<{
        studentId: string;
    }>;
}

export default async function Page({
    params,
}: Props) {
    const { studentId } =
        await params;

    return (
        <TeacherStudentDetailPage
            studentId={studentId}
        />
    );
}