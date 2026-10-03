import Link from "next/link";

export default function NotFound() {
  return <div className="py-20 text-center"><h1 className="text-2xl font-bold">Không tìm thấy bộ thẻ</h1><Link href="/teacher/flashcards" className="mt-4 inline-block font-semibold text-amber-600">Quay về quản lý Flashcard</Link></div>;
}
