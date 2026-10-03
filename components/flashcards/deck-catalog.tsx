"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Layers3, Plus, Pencil, Sparkles, Trash2 } from "lucide-react";
import { createDeck, deleteDeck, togglePublishDeck } from "@/app/actions/flashcards";
import type { FlashcardDeck } from "@/types/flashcards";
import { buttonClass, FlashcardEmpty, inputClass, pageClass, panelClass, ProgressBar, useFlashcardMutation } from "./shared";

const catalogButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";
const primaryClass = `${catalogButton} border-[#101527] bg-[#101527] text-white hover:border-slate-700 hover:bg-slate-800`;
const mutedButton = `${catalogButton} border-slate-100 bg-slate-100 text-slate-700 hover:bg-slate-200`;

export function DeckCatalog({ decks, teacher = false }: { decks: FlashcardDeck[]; teacher?: boolean }) {
  const router = useRouter();
  const { busy, run } = useFlashcardMutation();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  return <section className={`${pageClass} rounded-3xl bg-[#F8F9FC] p-2 sm:p-4`}>
    <header className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-slate-800 bg-[#101527] p-6 text-white sm:px-10 sm:py-11">
      <div className="min-w-0"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FBBF24]"><Sparkles className="size-4" />Ghi nhớ công thức mỗi ngày</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{teacher ? "Quản lý Flashcard" : "Flashcard Toán học"}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{teacher ? "Tạo bộ thẻ, biên soạn công thức và xuất bản cho học sinh." : "Ôn từng khái niệm, nhớ từng công thức. Chọn một bộ thẻ để bắt đầu."}</p>
      </div>
      {teacher ? <button className={`${catalogButton} border-slate-600 bg-slate-800 text-white hover:bg-slate-700`} disabled={busy} aria-expanded={creating} aria-controls="new-deck-form" onClick={() => setCreating(!creating)}><Plus className="size-4 text-[#FBBF24]" />{creating ? "Đóng form" : "Thêm bộ thẻ mới"}</button> : <span className="inline-flex items-center gap-3 rounded-full border border-slate-600/70 bg-slate-800/80 px-5 py-3 text-sm font-bold text-slate-200"><Layers3 className="size-5 text-[#FBBF24]" />{decks.length} bộ thẻ có sẵn</span>}
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
        const remembered = deck.card_count - deck.starred_count;
        const progress = deck.card_count ? Math.round(remembered / deck.card_count * 100) : 0;
        const hasCards = deck.card_count > 0;
        return <article key={deck.id} className={`group relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-3xl border-2 bg-white p-5 sm:p-7 ${hasCards ? "border-[#101527] shadow-sm" : "border-slate-200/70"}`}>
          <div className="flex items-center justify-between gap-3"><div className={`rounded-2xl p-3.5 ${hasCards ? "bg-[#101527] text-[#FBBF24]" : "bg-slate-100 text-slate-600"}`}><Layers3 className="size-5" /></div>
            <span className={`rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold ${hasCards ? "text-slate-900" : "text-slate-400"}`}>{deck.card_count} thẻ</span></div>
          <div className="flex-1 pb-2"><h2 className="break-words text-2xl font-black tracking-tight text-black">{deck.title}</h2><p className="mt-2 line-clamp-3 break-words text-sm font-medium leading-6 text-slate-700">{deck.description || "Ôn tập khái niệm và công thức toán học."}</p></div>
          {teacher ? <>
            <button disabled={busy} aria-pressed={deck.is_published} onClick={() => void run(() => togglePublishDeck(deck.id, !deck.is_published), deck.is_published ? "Đã chuyển về bản nháp." : "Đã xuất bản bộ thẻ.")}
              className={deck.is_published ? primaryClass : mutedButton}>{deck.is_published ? "Đã xuất bản" : "Bản nháp"}</button>
            <div className="flex gap-2"><Link className={`${primaryClass} flex-1`} href={`/teacher/flashcards/${deck.id}`}><Pencil className="size-4" />Biên tập</Link>
              <button disabled={busy} className={buttonClass} aria-label={`Xóa bộ thẻ ${deck.title}`} onClick={() => setDeleting(deleting === deck.id ? null : deck.id)}><Trash2 className="size-4 text-rose-600" /></button></div>
            {deleting === deck.id && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800"><p>Xóa bộ thẻ, toàn bộ thẻ con và dấu sao? Không thể hoàn tác.</p><div className="mt-3 flex gap-2">
              <button disabled={busy} className={buttonClass} onClick={async () => { if (await run(() => deleteDeck(deck.id), "Đã xóa bộ thẻ.")) setDeleting(null); }}>Xác nhận xóa</button>
              <button disabled={busy} className={buttonClass} onClick={() => setDeleting(null)}>Hủy</button></div></div>}
          </> : <>
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <ProgressBar value={progress} label={`Đã nhớ ${remembered}/${deck.card_count} thẻ`} tone="navy" />
              <p className="text-xs font-medium text-slate-700">{deck.starred_count} thẻ gắn sao cần xem lại</p>
            </div>
            <Link className={hasCards ? primaryClass : mutedButton} href={`/flashcards/${deck.id}`}>Bắt đầu học<ArrowRight className={`size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none ${hasCards ? "text-[#FBBF24]" : "text-slate-600"}`} /></Link>
          </>}
        </article>;
      })}</div>}
  </section>;
}
