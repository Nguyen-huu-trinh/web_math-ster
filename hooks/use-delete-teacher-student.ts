import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";
import { teacherStudentClientService } from "@/services/teacher-student-client.service";
import { toast } from "sonner";

export function useDeleteTeacherStudent() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            studentId: string
        ) =>
            teacherStudentClientService.delete(
                studentId
            ),

        onSuccess: async (_data, studentId) => {
            queryClient.removeQueries({ queryKey: queryKeys.teacherStudents.detail(studentId), exact: true });
            toast.success("Đã xóa học sinh và tài khoản đăng nhập.");
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.teacherStudents.all() }),
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacher }),
                queryClient.invalidateQueries({ queryKey: ["teacher-tutoring-slots"] }),
            ]);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Không thể xóa học sinh."),
    });
}
