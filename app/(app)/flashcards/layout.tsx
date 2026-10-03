import { requireStudent } from "@/lib/auth";

export default async function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  await requireStudent();
  return children;
}
