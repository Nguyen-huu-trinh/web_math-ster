import { useMutation } from "@tanstack/react-query";

import { studentExamClientService } from "@/services/student-exam-client.service";

export function useStartExam() {
  return useMutation({
    mutationFn: (examId: string) =>
      studentExamClientService.startExam(
        examId
      ),
  });
}