import { useQuery } from "@tanstack/react-query";

export interface StudentProgressItem {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number;
  date: string;
  attemptNumber: number;
}

export function useStudentProgress() {
  return useQuery<StudentProgressItem[]>({
    queryKey: ["student-progress"],

    queryFn: async () => {
      const response = await fetch(
        "/api/dashboard/progress"
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Không thể lấy dữ liệu điểm."
        );
      }

      return data;
    },
  });
}