export const queryKeys = {

  dashboard: {
    student: ["dashboard", "student"] as const,
    teacher: ["dashboard", "teacher"] as const,
    leaderboard: ["dashboard", "leaderboard"] as const,
  },

  course: {
    all: ["courses"] as const,
    detail: (courseId: string, studentId?: string) =>
      ["course", courseId, studentId ?? "anonymous"] as const,
  },

  lesson: {
    detail: (lessonId: string) =>
      ["lesson", lessonId] as const,
  },

  exam: {

    all: ["exams"] as const,

    detail: (id: string) =>
      ["exam", id] as const,

    answerKey: (id: string) =>
      ["exam-answer-key", id] as const,

  },

  profile: {
    current: ["profile"] as const,
    detail: (id: string) => ["profile", id] as const,
  },

  student: {
    myExams: () => ["student", "my-exams"] as const,
  },

  attempt: {
    detail: (id: string) => ["attempt", id] as const,
    answers: (id: string) => ["attempt", id, "answers"] as const,
  },

};
