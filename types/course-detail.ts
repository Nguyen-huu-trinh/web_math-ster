import { Chapter } from "./chapter";

export interface CourseDetail {
  id: string;

  title: string;

  description: string;

  category: string;

  thumbnail_url: string | null;

  thumbnail?: string;

  teacher: string;

  totalLessons: number;

  progress: number;

  chapters: Chapter[];

  created_at: string;

  updated_at: string;
}