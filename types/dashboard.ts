export interface StudentDashboard {

  profile: {
    full_name: string;
  };

  totalCourses: number;

  completedLessons: number;

  totalAttempts: number;

  averageScore: number;
}

export interface TeacherDashboard {

  totalCourses: number;

  totalLessons: number;

  totalStudents: number;

  totalExams: number;
}