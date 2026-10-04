"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, Lightbulb, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { createFlashcard, deleteFlashcard, reorderFlashcards, togglePublishDeck, updateDeck, updateFlashcard } from "@/app/actions/flashcards";
import type { Flashcard, FlashcardDeckDetail, FlashcardInput } from "@/types/flashcards";
import { MathText } from "./math-text";
import { answerSurfaceClass, questionSurfaceClass, heroClass, heroLabelClass, badgeClass, buttonClass, FlashcardEmpty, inputClass, labelClass, noteClass, pageClass, panelClass, primaryClass, useFlashcardMutation } from "./shared";

const emptyCard: FlashcardInput = { question: "", answer: "", note: "" };
const mathPlaceholders = {
  question: String.raw`Tọa độ trung điểm của đoạn thẳng $AB$ là gì?`,
  answer: String.raw`$$M\left(\frac{x_A+x_B}{2},\frac{y_A+y_B}{2}\right)$$`,
  note: String.raw`Ghi nhớ: $\vec{MA}+\vec{MB}=\vec{0}$.`,
};

export function DeckEditor({ deck }: { deck: FlashcardDeckDetail }) {
  const { busy, run } = useFlashcardMutation();
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description ?? "");
  const [orderIndex, setOrderIndex] = useState(String(deck.order_index));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FlashcardInput>(emptyCard);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function edit(card: Flashcard) {
    setEditingId(card.id);
    setDraft({ question: card.question, answer: card.answer, note: card.note ?? "" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function move(index: number, offset: number) {
    const order = deck.cards.map((card) => card.id);
    [order[index], order[index + offset]] = [order[index + offset], order[index]];
    await run(() => reorderFlashcards(deck.id, order), "Đã cập nhật thứ tự thẻ.");
  }

  return <section className={pageClass}>
    <Link href="/teacher/flashcards" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="size-4" />Danh sách bộ thẻ</Link>
    <header className={heroClass}><div className="min-w-0 flex-1"><p className={heroLabelClass}>Biên tập bộ thẻ / {deck.cards.length} thẻ</p><h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">{deck.title}</h1><p className="mt-3 text-sm text-slate-300">Biên soạn rõ ràng. Xem trước từng công thức trước khi xuất bản.</p></div>
      <button disabled={busy} className={deck.is_published ? buttonClass : primaryClass} onClick={() => void run(() => togglePublishDeck(deck.id, !deck.is_published), deck.is_published ? "Đã chuyển về bản nháp." : "Đã xuất bản bộ thẻ.")}>{deck.is_published ? "Đã xuất bản · Chuyển về nháp" : "Xuất bản bộ thẻ"}</button>
    </header>

    <form className={panelClass} onSubmit={async (event) => { event.preventDefault(); await run(() => updateDeck(deck.id, { title, description, order_index: Number(orderIndex) }), "Đã lưu thông tin bộ thẻ."); }}>
      <fieldset disabled={busy} className="min-w-0 space-y-4"><legend className="mb-4 text-lg font-semibold tracking-tight">Thông tin bộ thẻ</legend>
        <label className="block space-y-2 text-sm font-semibold"><span>Thứ tự hiển thị</span><input type="number" required min={0} max={2147483647} step={1} className={inputClass} value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} aria-describedby="deck-order-help" /></label>
        <p id="deck-order-help" className="text-sm text-slate-500">Số nhỏ hiển thị trước. Nếu trùng số, bộ tạo mới hơn hiển thị trước.</p>
        <label className="block space-y-2 text-sm font-semibold"><span>Tên chuyên đề</span><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></label>
        <label className="block space-y-2 text-sm font-semibold"><span>Mô tả</span><textarea className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={5000} /></label>
        <button className={buttonClass} disabled={!title.trim()}><Save className="size-4" />Lưu thông tin</button>
      </fieldset>
    </form>

    <form ref={formRef} className={`${panelClass} scroll-mt-24`} onSubmit={async (event) => {
      event.preventDefault();
      const result = await run(() => editingId ? updateFlashcard(editingId, draft) : createFlashcard(deck.id, draft).then((response) => response.ok ? { ok: true as const, data: undefined } : response), editingId ? "Đã cập nhật thẻ." : "Đã thêm thẻ mới.");
      if (result) { setEditingId(null); setDraft(emptyCard); }
    }}>
      <fieldset disabled={busy} className="min-w-0"><legend className="mb-3 text-lg font-semibold tracking-tight">{editingId ? "Chỉnh sửa thẻ" : "Thêm thẻ mới"}</legend>
        <p className="mb-6 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-sm leading-7 text-slate-500 [&_code]:break-all [&_code]:rounded [&_code]:bg-white [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-slate-700">Dùng <code>$...$</code> hoặc <code>{String.raw`\(...\)`}</code> cho công thức trong dòng; <code>$$...$$</code> hoặc <code>{String.raw`\[...\]`}</code> cho công thức riêng dòng. Ví dụ: <code>{String.raw`$\frac{x_A+x_B}{2}$`}</code>. Công thức LaTeX chưa có dấu bao được tự nhận diện; nên dùng dấu bao khi viết xen với lời giải. Nhập một dấu <code>{"\\"}</code> trước tên lệnh.</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-5">{([
            ["question", "Câu hỏi / Khái niệm", 10000], ["answer", "Đáp án / Công thức", 10000], ["note", "Ghi chú / Mẹo ghi nhớ", 5000],
          ] as const).map(([field, label, max]) => <label key={field} className="block space-y-2 text-sm font-semibold"><span>{label}{field !== "note" && " *"}</span>
            <textarea required={field !== "note"} maxLength={max} rows={field === "note" ? 2 : 4} placeholder={mathPlaceholders[field]} className={`${inputClass} font-mono`} value={draft[field] ?? ""} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
          </label>)}</div>
          <div className="min-w-0 self-start rounded-3xl border border-slate-700 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4 shadow-lg sm:p-5 lg:sticky lg:top-6"><p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FACC15]"><Eye className="size-4" />Xem trước trực tiếp</p>
            <div className={`${questionSurfaceClass} rounded-2xl p-5 shadow-sm`}><p className={`mb-4 ${labelClass}`}>Mặt trước</p><MathText text={draft.question || "Câu hỏi sẽ hiển thị tại đây…"} className="max-h-64 overflow-auto py-3 text-center text-xl font-semibold text-slate-800" /></div>
            <div className={`${answerSurfaceClass} mt-4 rounded-2xl p-5`}><p className={`mb-4 ${labelClass}`}>Mặt sau</p><div className="rounded-2xl border border-amber-200/60 border-t-4 border-t-[#FACC15] bg-white px-4 py-5 shadow-sm"><MathText text={draft.answer || "Đáp án sẽ hiển thị tại đây…"} className="max-h-64 overflow-auto text-center text-xl font-semibold text-slate-900" /></div>
              {draft.note && <div className={`mt-4 ${noteClass}`}><p className="mb-2 flex items-center gap-2 text-xs font-medium"><Lightbulb className="size-3.5 text-amber-500" />Mẹo ghi nhớ</p><MathText text={draft.note} className="max-h-40 overflow-auto text-sm leading-relaxed" /></div>}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200/60 pt-6"><button className={primaryClass} disabled={!draft.question.trim() || !draft.answer.trim()}>{editingId ? <Save className="size-4" /> : <Plus className="size-4" />}{busy ? "Đang lưu…" : editingId ? "Lưu thay đổi" : "Thêm thẻ"}</button>
          {editingId && <button type="button" className={buttonClass} onClick={() => { setEditingId(null); setDraft(emptyCard); }}>Hủy chỉnh sửa</button>}</div>
      </fieldset>
    </form>

    <div className="space-y-4"><h2 className="text-xl font-bold">Các thẻ trong bộ ({deck.cards.length})</h2>
      {deck.cards.length === 0 && <FlashcardEmpty title="Bộ thẻ đang trống" description="Nhập câu hỏi và công thức ở form phía trên để tạo thẻ đầu tiên." />}
      {deck.cards.map((card, index) => <article key={card.id} className={panelClass}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5"><span className={badgeClass}>Thẻ {index + 1}</span><div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy || index === 0} aria-label={`Đưa thẻ ${index + 1} lên`} className={buttonClass} onClick={() => void move(index, -1)}><ArrowUp className="size-4" /></button>
          <button type="button" disabled={busy || index === deck.cards.length - 1} aria-label={`Đưa thẻ ${index + 1} xuống`} className={buttonClass} onClick={() => void move(index, 1)}><ArrowDown className="size-4" /></button>
          <button type="button" disabled={busy} aria-label={`Sửa thẻ ${index + 1}`} className={buttonClass} onClick={() => edit(card)}><Pencil className="size-4" /></button>
          <button type="button" disabled={busy} aria-label={`Xóa thẻ ${index + 1}`} className={buttonClass} onClick={() => setDeletingId(card.id)}><Trash2 className="size-4 text-rose-500" /></button>
        </div></div>
        <div className="grid gap-5 sm:grid-cols-2"><div className={`${questionSurfaceClass} min-w-0 rounded-2xl p-5`}><p className={`mb-4 ${labelClass}`}>Câu hỏi</p><MathText text={card.question} className="text-lg font-medium" /></div><div className={`${answerSurfaceClass} min-w-0 rounded-2xl p-5`}><p className={`mb-4 ${labelClass}`}>Đáp án</p><MathText text={card.answer} className="text-lg font-medium" />{card.note && <div className={`mt-4 ${noteClass}`}><p className="mb-2 flex items-center gap-2 text-xs font-medium"><Lightbulb className="size-3.5 text-amber-500" />Mẹo ghi nhớ</p><MathText text={card.note} className="text-sm" /></div>}</div></div>
        {deletingId === card.id && <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 p-3 text-sm"><span>Xóa thẻ này và tiến độ liên quan?</span>
          <button disabled={busy} className={buttonClass} onClick={async () => { if (await run(() => deleteFlashcard(card.id), "Đã xóa thẻ.")) { setDeletingId(null); if (editingId === card.id) { setEditingId(null); setDraft(emptyCard); } } }}>Xác nhận xóa</button>
          <button disabled={busy} className={buttonClass} onClick={() => setDeletingId(null)}>Hủy</button></div>}
      </article>)}
    </div>
  </section>;
}
