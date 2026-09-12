import { useQuery } from "@tanstack/react-query";

export type ExamAlert = {
  id: string;
  type: "FAILED" | "OVERDUE";
  studentId: string;
  studentName: string;
  studentCode: string | null;
  examId: string;
  examTitle: string;
  attemptId: string | null;
  score?: number | null;
  overdueDays?: number;
  createdAt: string;
  enrolledAt?: string | null;
};

export function useExamAlerts() {
  return useQuery<ExamAlert[]>({
    queryKey: ["teacher", "exam-alerts"],
    queryFn: async () => {
      const response = await fetch(
        "/api/teachers/exam-alerts",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Không thể tải cảnh báo."
        );
      }

      return data.alerts ?? [];
    },

    staleTime: 300 * 1000,
  });
}