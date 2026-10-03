import { requireTeacher } from "@/lib/auth";

export default async function TeacherFlashcardsLayout({ children }: { children: React.ReactNode }) {
  await requireTeacher();
  return children;
}
