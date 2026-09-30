import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";
import { teacherStudentClientService } from "@/services/teacher-student-client.service";
import { toast } from "sonner";
import type { UpdateTeacherStudentInput } from "@/validators/teacher-student.schema";

export function useUpdateTeacherStudent(
    studentId: string
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            values: UpdateTeacherStudentInput
        ) =>
            teacherStudentClientService.update(
                studentId,
                values
            ),

        onSuccess: async () => {
            // This prefix includes the detail, global list and course lists.
            await queryClient.invalidateQueries({
                queryKey: queryKeys.teacherStudents.all(),
            });
            toast.success("Đã cập nhật thông tin học sinh.");
        },
        onError: (error) => {
            toast.error(error.message || "Không thể cập nhật thông tin học sinh.");
        },
    });
}
