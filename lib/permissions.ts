export enum Permission {
  MANAGE_USERS = "MANAGE_USERS",

  MANAGE_COURSES = "MANAGE_COURSES",

  MANAGE_EXAMS = "MANAGE_EXAMS",

  VIEW_REPORTS = "VIEW_REPORTS",

  STUDY = "STUDY",

  TAKE_EXAM = "TAKE_EXAM",
}

export const ROLE_PERMISSIONS = {
  ADMIN: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_COURSES,
    Permission.MANAGE_EXAMS,
    Permission.VIEW_REPORTS,
  ],

  TEACHER: [
    Permission.MANAGE_COURSES,
    Permission.MANAGE_EXAMS,
    Permission.VIEW_REPORTS,
  ],

  STUDENT: [
    Permission.STUDY,
    Permission.TAKE_EXAM,
  ],
} as const;