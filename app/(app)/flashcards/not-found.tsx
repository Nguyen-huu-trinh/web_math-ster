import Link from "next/link";

export default function NotFound() {
  return <div className="mx-auto max-w-lg px-5 py-20 text-center"><h1 className="text-2xl font-bold">Bộ thẻ không khả dụng</h1><p className="my-4 text-slate-500">Bộ thẻ có thể đã bị xóa hoặc chưa được xuất bản.</p><Link href="/flashcards" className="font-semibold text-amber-600">Quay về danh mục Flashcard</Link></div>;
}
