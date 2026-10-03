"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Layers3, Plus, Pencil, Trash2 } from "lucide-react";
import { createDeck, deleteDeck, togglePublishDeck } from "@/app/actions/flashcards";
import type { FlashcardDeck } from "@/types/flashcards";
import { badgeClass, buttonClass, FlashcardEmpty, heroClass, heroLabelClass, inputClass, learnedClass, pageClass, panelClass, primaryClass, ProgressBar, useFlashcardMutation } from "./shared";

// Stable colors per deck, echoing the course catalog's blue/emerald/amber palette.
const deckTones = [
  { surface: "from-blue-50/90 via-white to-white", icon: "border-blue-200 bg-blue-100 text-blue-700", accent: "bg-blue-500" },
  { surface: "from-emerald-50/90 via-white to-white", icon: "border-emerald-200 bg-emerald-100 text-emerald-700", accent: "bg-emerald-500" },
  { surface: "from-amber-50/90 via-white to-white", icon: "border-amber-200 bg-amber-100 text-amber-700", accent: "bg-[#FACC15]" },
];

export function DeckCatalog({ decks, teacher = false }: { decks: FlashcardDeck[]; teacher?: boolean }) {
  const router = useRouter();
  const { busy, run } = useFlashcardMutation();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  return <section className={pageClass}>
    <header className={heroClass}>
      <div className="min-w-0"><p className={heroLabelClass}>Math-Ster / Ghi nhớ mỗi ngày</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{teacher ? "Quản lý Flashcard" : "Flashcard Toán học"}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{teacher ? "Tạo bộ thẻ, biên soạn công thức và xuất bản cho học sinh." : "Ôn từng khái niệm, nhớ từng công thức. Chọn một bộ thẻ để bắt đầu."}</p>
      </div>
      {teacher ? <button className={primaryClass} disabled={busy} aria-expanded={creating} aria-controls="new-deck-form" onClick={() => setCreating(!creating)}><Plus className="size-4" />{creating ? "Đóng form" : "Thêm bộ thẻ mới"}</button> : <span className={badgeClass}><Layers3 className="size-3.5" />{decks.length} bộ thẻ</span>}
    </header>

    {teacher && creating && <form id="new-deck-form" className={`${panelClass} space-y-4`} onSubmit={async (event) => {
      event.preventDefault();
      const result = await run(() => createDeck({ title, description }), "Đã tạo bộ thẻ nháp.");
      if (result) router.push(`/teacher/flashcards/${result.data}`);
    }}>
      <h2 className="font-bold">Bộ thẻ mới</h2>
      <label className="block space-y-2 text-sm font-semibold"><span>Tên bộ thẻ</span><input autoFocus required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Ví dụ: Vectơ và tọa độ Oxyz" /></label>
      <label className="block space-y-2 text-sm font-semibold"><span>Mô tả (không bắt buộc)</span><textarea maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={3} /></label>
      <button disabled={busy || !title.trim()} className={primaryClass}>{busy ? "Đang tạo…" : "Tạo và biên tập"}</button>
    </form>}

    {decks.length === 0 ? <FlashcardEmpty title={teacher ? "Chưa có bộ thẻ nào" : "Chưa có bộ thẻ được xuất bản"} description={teacher ? "Thêm bộ thẻ đầu tiên để xây dựng thư viện công thức của lớp." : "Các bộ thẻ sẽ xuất hiện tại đây khi giáo viên xuất bản."} /> :
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{decks.map((deck) => {
        const progress = deck.card_count ? Math.round(deck.learned_count / deck.card_count * 100) : 0;
        const tone = deckTones[Array.from(deck.id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % deckTones.length];
        return <article key={deck.id} className={`${panelClass} ${tone.surface} group relative flex flex-col gap-5 overflow-hidden bg-gradient-to-br transition duration-300 hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.12)] motion-reduce:transform-none motion-reduce:transition-none`}>
          <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tone.accent}`} />
          <div className="flex items-center justify-between gap-3"><div className={`rounded-2xl border p-3.5 ${tone.icon}`}><Layers3 className="size-5" /></div>
            <span className={badgeClass}>{deck.card_count} thẻ</span></div>
          <div className="flex-1 pb-2"><h2 className="break-words text-xl font-semibold tracking-tight">{deck.title}</h2><p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-500">{deck.description || "Ôn tập khái niệm và công thức toán học."}</p></div>
          {teacher ? <>
            <button disabled={busy} aria-pressed={deck.is_published} onClick={() => void run(() => togglePublishDeck(deck.id, !deck.is_published), deck.is_published ? "Đã chuyển về bản nháp." : "Đã xuất bản bộ thẻ.")}
              className={deck.is_published ? learnedClass : buttonClass}>{deck.is_published ? "Đã xuất bản" : "Bản nháp"}</button>
            <div className="flex gap-2"><Link className={`${primaryClass} flex-1`} href={`/teacher/flashcards/${deck.id}`}><Pencil className="size-4" />Biên tập</Link>
              <button disabled={busy} className={buttonClass} aria-label={`Xóa bộ thẻ ${deck.title}`} onClick={() => setDeleting(deleting === deck.id ? null : deck.id)}><Trash2 className="size-4 text-rose-600" /></button></div>
            {deleting === deck.id && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800"><p>Xóa bộ thẻ, toàn bộ thẻ con và tiến độ học? Không thể hoàn tác.</p><div className="mt-3 flex gap-2">
              <button disabled={busy} className={buttonClass} onClick={async () => { if (await run(() => deleteDeck(deck.id), "Đã xóa bộ thẻ.")) setDeleting(null); }}>Xác nhận xóa</button>
              <button disabled={busy} className={buttonClass} onClick={() => setDeleting(null)}>Hủy</button></div></div>}
          </> : <>
            <ProgressBar value={progress} label={`Đã nhớ ${deck.learned_count}/${deck.card_count} thẻ`} />
            <Link className={`${primaryClass} active:scale-[0.98]`} href={`/flashcards/${deck.id}`}>Bắt đầu học<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" /></Link>
          </>}
        </article>;
      })}</div>}
  </section>;
}
