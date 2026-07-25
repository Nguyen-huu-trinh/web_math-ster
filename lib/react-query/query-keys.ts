export const queryKeys = {

  dashboard: {
    student: ["dashboard", "student"] as const,
    teacher: ["dashboard", "teacher"] as const,
    leaderboard: ["dashboard", "leaderboard"] as const,
  },

  course: {
    all: ["courses"] as const,
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
  },

};