"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lightbulb, RotateCcw, Shuffle, Star, Trophy } from "lucide-react";
import { toast } from "sonner";
import { updateCardProgress } from "@/app/actions/flashcards";
import { nextUnrated, sessionStats, shuffleCards, studyQueue, type StudyFilter } from "@/lib/flashcards/study";
import type { FlashcardDeckDetail, FlashcardStatus, ProgressInput } from "@/types/flashcards";
import { MathText } from "./math-text";
import { answerSurfaceClass, questionSurfaceClass, badgeClass, buttonClass, FlashcardEmpty, kbdClass, labelClass, learnedClass, noteClass, panelClass, primaryClass, ProgressBar, reviewClass } from "./shared";

export function StudyRoom({ deck }: { deck: FlashcardDeckDetail }) {
  const [cards, setCards] = useState(deck.cards);
  const [queue, setQueue] = useState(() => studyQueue(deck.cards, "all"));
  const [filter, setFilter] = useState<StudyFilter>("all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, FlashcardStatus>>({});
  const [summary, setSummary] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const card = cards.find((item) => item.id === queue[index]);
  const stats = sessionStats(queue, ratings);
  const learnedTotal = cards.filter((item) => item.progress?.status === "LEARNED").length;

  async function persist(cardId: string, input: ProgressInput) {
    if (lock.current) return null;
    lock.current = true;
    setBusy(true);
    try {
      const result = await updateCardProgress(cardId, input);
      if (!result.ok) { toast.error(result.error); return null; }
      setCards((previous) => previous.map((item) => item.id === cardId ? { ...item, progress: result.data } : item));
      return result.data;
    } catch {
      toast.error("Chưa lưu được tiến độ. Vui lòng kiểm tra kết nối và thử lại.");
      return null;
    } finally { lock.current = false; setBusy(false); }
  }

  function restart(nextFilter: StudyFilter, selectedIds?: string[]) {
    if (lock.current) return;
    setFilter(nextFilter);
    setQueue(selectedIds ?? studyQueue(cards, nextFilter));
    setIndex(0); setFlipped(false); setRatings({}); setSummary(false);
  }

  async function flip() {
    if (!card || lock.current || summary) return;
    setFlipped(!flipped);
    if (!flipped && !card.progress?.reviewed_at) {
      await persist(card.id, { status: card.progress?.status ?? "REVIEW_NEEDED" });
    }
  }

  function navigate(offset: number) {
    if (lock.current || !queue.length || summary) return;
    setIndex((previous) => (previous + offset + queue.length) % queue.length);
    setFlipped(false);
  }

  async function rate(status: FlashcardStatus) {
    if (!card || lock.current || summary) return;
    const result = await persist(card.id, { status });
    if (!result) return; // Failed saves must never advance the session or count as completed.
    const nextRatings = { ...ratings, [card.id]: status };
    setRatings(nextRatings);
    toast.success(status === "LEARNED" ? "Đã đánh dấu: Đã nhớ" : "Đã đánh dấu: Chưa nhớ", { id: "flashcard-rating", duration: 1200 });
    const next = nextUnrated(queue, nextRatings, index);
    if (next === -1) setSummary(true);
    else { setIndex(next); setFlipped(false); }
  }

  async function toggleStar() {
    if (!card || lock.current) return;
    const result = await persist(card.id, { isStarred: !card.progress?.is_starred });
    if (!result) return;
    toast.success(result.is_starred ? "Đã gắn sao thẻ." : "Đã bỏ gắn sao.", { id: "flashcard-star" });
    if (filter === "starred" && !result.is_starred) {
      const next = queue.filter((id) => id !== card.id);
      setQueue(next); setIndex(Math.min(index, Math.max(0, next.length - 1))); setFlipped(false);
      if (next.length && next.every((id) => ratings[id])) setSummary(true);
    }
  }

  // Rebind each render so shortcuts always use the current card and session state.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || target?.closest("input, textarea, select, [contenteditable='true']")) return;
      // Let focused native controls handle Space themselves (avoid a second flip).
      if (event.code === "Space" && target?.closest("button, a")) return;
      if (summary) return;
      if (!["Space", "ArrowLeft", "ArrowRight", "Digit1", "Digit2", "Numpad1", "Numpad2"].includes(event.code)) return;
      event.preventDefault();
      if (busy) return;
      if (event.code === "Space") void flip();
      else if (event.code === "ArrowLeft") navigate(-1);
      else if (event.code === "ArrowRight") navigate(1);
      else if (event.code === "Digit1" || event.code === "Numpad1") void rate("REVIEW_NEEDED");
      else void rate("LEARNED");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return <section className="min-h-dvh bg-gradient-to-b from-[#EEF2F8] via-[#F8FAFC] to-[#FFFBEB] text-slate-900">
    <header className="border-b border-slate-700 bg-[#0F172A] px-4 py-4 text-white shadow-lg shadow-slate-900/10 sm:px-8"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
      <Link href="/flashcards" className={buttonClass}><ArrowLeft className="size-4" />Bộ thẻ</Link>
      <h1 className="order-last w-full break-words text-center text-base font-semibold tracking-tight sm:order-none sm:w-auto sm:max-w-md sm:text-lg">{deck.title}</h1>
      <span className={badgeClass}><Check className="size-3.5" />Đã nhớ {learnedTotal}/{cards.length}</span>
    </div></header>
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
      {summary ? <div className={`${panelClass} text-center sm:!p-12`}>
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl border border-yellow-300 bg-[#FACC15] text-slate-950"><Trophy className="size-9" /></div>
        <p className={labelClass}>Hoàn thành lượt ôn</p>
        <h2 className="mt-3 text-3xl font-extrabold">Bạn đã ôn {queue.length} thẻ!</h2>
        <p className="mt-3 text-sm text-slate-500">Tiến độ đã được lưu. Tiếp tục ôn những công thức cần củng cố.</p>
        <div className="my-8 grid grid-cols-2 gap-4"><div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-6"><p className="text-4xl font-semibold tabular-nums text-emerald-600">{stats.learned}</p><p className="mt-2 text-sm text-emerald-700">Đã nhớ</p></div><div className="rounded-2xl border border-rose-200/60 bg-rose-50/70 p-6"><p className="text-4xl font-semibold tabular-nums text-rose-600">{stats.review}</p><p className="mt-2 text-sm text-rose-700">Chưa nhớ</p></div></div>
        <div className="flex flex-wrap justify-center gap-3"><button className={primaryClass} disabled={stats.review === 0} onClick={() => restart("review", queue.filter((id) => ratings[id] === "REVIEW_NEEDED"))}><RotateCcw className="size-4" />Chỉ ôn lại các thẻ chưa nhớ</button>
          <button className={buttonClass} onClick={() => restart("all")}>Học lại từ đầu</button></div>
        <p className="mt-4 text-xs text-slate-400">Học lại tạo lượt ôn mới và giữ tiến độ đã lưu.</p>
      </div> : <>
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">
          <button disabled={busy} aria-pressed={filter === "all"} onClick={() => restart("all")} className={filter === "all" ? primaryClass : buttonClass}>Tất cả thẻ</button>
          <button disabled={busy} aria-pressed={filter === "starred"} onClick={() => restart("starred")} className={filter === "starred" ? primaryClass : buttonClass}><Star className="size-4" />Chỉ thẻ gắn sao</button>
          {filter === "review" && <span className="self-center rounded-full border border-rose-200/60 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">Đang ôn thẻ chưa nhớ</span>}
        </div><button disabled={busy || queue.length < 2} className={buttonClass} onClick={() => { setQueue(shuffleCards(queue)); setIndex(0); setFlipped(false); toast.success("Đã xáo trộn thẻ."); }}><Shuffle className="size-4" />Xáo trộn</button></div>
        <ProgressBar value={stats.percent} label={`Lượt ôn này: ${stats.done}/${queue.length} thẻ đã đánh giá`} />
        {!card ? <FlashcardEmpty title={cards.length === 0 ? "Bộ thẻ chưa có nội dung" : filter === "starred" ? "Chưa có thẻ gắn sao" : "Không có thẻ cần ôn lại"} description="Chọn Tất cả thẻ để xem nội dung, hoặc quay về danh mục để chọn bộ thẻ khác." /> : <>
          <div className="relative [perspective:1200px]">
            <button aria-label={card.progress?.is_starred ? "Bỏ gắn sao thẻ" : "Gắn sao thẻ"} aria-pressed={card.progress?.is_starred ?? false} disabled={busy} onClick={() => void toggleStar()} className={`${buttonClass} absolute right-4 top-4 z-10 !rounded-full !p-3 shadow-sm sm:right-6 sm:top-6`}><Star className={`size-4 ${card.progress?.is_starred ? "fill-amber-300 text-amber-500" : "text-slate-400"}`} /></button>
            <div key={card.id} role="button" tabIndex={0} aria-label={flipped ? "Mặt đáp án. Nhấn để xem câu hỏi." : "Mặt câu hỏi. Nhấn để xem đáp án."} aria-disabled={busy}
              onClick={() => void flip()} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void flip(); } }}
              className="grid cursor-pointer rounded-3xl outline-none transition-transform duration-500 ease-out motion-reduce:transition-none focus-visible:ring-4 focus-visible:ring-slate-300/60"
              style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              <div aria-hidden={flipped} className={`${questionSurfaceClass} col-start-1 row-start-1 flex min-h-96 min-w-0 flex-col rounded-3xl p-6 shadow-[0_16px_48px_-16px_rgba(37,99,235,0.2)] sm:min-h-[28rem] sm:p-10`} style={{ backfaceVisibility: "hidden" }}>
                <div className="mb-8 flex flex-wrap items-center gap-3 pr-12"><span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">Câu hỏi</span><span className={labelClass}>{index + 1} / {queue.length}</span></div>
                <div className="flex min-w-0 flex-1 items-center justify-center py-4"><MathText text={card.question} className="max-h-[50dvh] w-full overflow-auto text-center text-2xl font-semibold leading-relaxed tracking-tight text-slate-800 sm:text-3xl" /></div>
                <p className="mt-8 text-center text-xs font-medium text-slate-400">Nhấn để xem đáp án <span className="mx-1">·</span> <kbd className={kbdClass}>Space</kbd></p>
              </div>
              <div aria-hidden={!flipped} className={`${answerSurfaceClass} col-start-1 row-start-1 flex min-h-96 min-w-0 flex-col rounded-3xl p-6 shadow-[0_16px_48px_-16px_rgba(245,158,11,0.2)] sm:min-h-[28rem] sm:p-10`} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <div className="mb-6 flex flex-wrap items-center gap-3 pr-12"><span className={badgeClass}>Đáp án</span><span className={labelClass}>{index + 1} / {queue.length}</span></div>
                <div className="flex min-w-0 flex-1 items-center justify-center py-4">
                  <div className="w-full min-w-0 rounded-2xl border border-amber-200/60 border-t-4 border-t-[#FACC15] bg-white px-4 py-6 shadow-sm sm:px-6">
                    <MathText text={card.answer} className="max-h-[45dvh] overflow-auto text-center text-2xl font-semibold leading-relaxed text-slate-900 sm:text-3xl" />
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {card.note && <div className={`${noteClass} max-w-lg text-left`}>
                    <p className="mb-1.5 flex items-center gap-2 text-xs font-medium"><Lightbulb className="size-3.5 shrink-0 text-amber-500" />Mẹo ghi nhớ</p>
                    <MathText text={card.note} className="max-h-32 overflow-auto text-sm leading-relaxed" />
                  </div>}
                  <p className="text-center text-xs font-medium text-slate-400">Bạn đã nhớ công thức này chưa?</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button disabled={busy} className={reviewClass} onClick={() => void rate("REVIEW_NEEDED")}><RotateCcw className="size-4" />Chưa nhớ <kbd className={kbdClass}>1</kbd></button>
            <button disabled={busy} className={learnedClass} onClick={() => void rate("LEARNED")}><Check className="size-4" />Đã nhớ <kbd className={kbdClass}>2</kbd></button>
            <button disabled={busy} className={primaryClass} onClick={() => void flip()}><RotateCcw className="size-4" />{flipped ? "Xem câu hỏi" : "Lật thẻ"}</button>
          </div>
          <div className="flex items-center justify-between gap-4"><button aria-label="Thẻ trước" disabled={busy || queue.length < 2} className={buttonClass} onClick={() => navigate(-1)}><ArrowLeft className="size-4" /><span className="hidden sm:inline">Thẻ trước</span></button>
            <p role="status" aria-live="polite" className="text-center text-xs text-slate-500">{busy ? "Đang lưu tiến độ…" : `Thẻ ${index + 1} / ${queue.length}`}</p>
            <button aria-label="Thẻ tiếp theo" disabled={busy || queue.length < 2} className={primaryClass} onClick={() => navigate(1)}><span className="hidden sm:inline">Thẻ tiếp</span><ArrowRight className="size-4" /></button></div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-200/60 pt-5 text-xs font-medium text-slate-400">
            <span><kbd className={kbdClass}>Space</kbd> Lật thẻ</span><span><kbd className={kbdClass}>←</kbd> <kbd className={kbdClass}>→</kbd> Chuyển thẻ</span><span><kbd className={kbdClass}>1</kbd> Chưa nhớ</span><span><kbd className={kbdClass}>2</kbd> Đã nhớ</span>
          </div>
        </>}
      </>}
    </div>
  </section>;
}
