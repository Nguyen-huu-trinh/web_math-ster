"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Lightbulb, RotateCcw, Shuffle, Star, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useStarSync } from "@/lib/flashcards/use-star-sync";
import { nextUnrated, sessionStats, shuffleCards, studyQueue, type StudyFilter } from "@/lib/flashcards/study";
import type { FlashcardDeckDetail } from "@/types/flashcards";
import { FitMathText } from "./fit-math-text";
import { answerSurfaceClass, questionSurfaceClass, badgeClass, buttonClass, FlashcardEmpty, kbdClass, labelClass, noteClass, panelClass, primaryClass, ProgressBar } from "./shared";

const toolbarButton = "inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

export function StudyRoom({ deck }: { deck: FlashcardDeckDetail }) {
  const router = useRouter();
  const { enqueue, flush, state: syncState } = useStarSync(deck.id);
  const [cards, setCards] = useState(deck.cards);
  const [queue, setQueue] = useState(() => studyQueue(deck.cards, "all"));
  const [filter, setFilter] = useState<StudyFilter>("all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState(false);
  const card = cards.find((item) => item.id === queue[index]);
  const stats = sessionStats(queue, ratings);
  const starredCount = cards.filter((item) => item.progress?.is_starred).length;
  const reviewIds = queue.filter((id) => cards.find((item) => item.id === id)?.progress?.is_starred);

  function restart(nextFilter: StudyFilter, selectedIds?: string[]) {
    void flush();
    setFilter(nextFilter);
    setQueue(selectedIds ?? studyQueue(cards, nextFilter));
    setIndex(0); setFlipped(false); setRatings({}); setSummary(false);
  }

  function flip() {
    if (card && !summary) setFlipped(!flipped);
  }

  function previous() {
    if (!queue.length || summary) return;
    setIndex((current) => Math.max(0, current - 1));
    setFlipped(false);
  }

  function advance() {
    if (!card || summary) return;
    const nextRatings = { ...ratings, [card.id]: true };
    setRatings(nextRatings);
    const next = nextUnrated(queue, nextRatings, index);
    if (next === -1) { setSummary(true); void flush(); }
    else { setIndex(next); setFlipped(false); }
  }

  function toggleStar() {
    if (!card || summary) return;
    const starred = !card.progress?.is_starred;
    setCards((current) => current.map((item) => item.id === card.id
      ? { ...item, progress: { is_starred: starred } } : item));
    enqueue(card.id, starred);
    // Keep the current queue stable; the next review round uses the latest stars.
  }

  // Rebind each render so shortcuts always use the current card and session state.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || target?.closest("input, textarea, select, [contenteditable='true']")) return;
      // Let focused native controls handle Space themselves (avoid a second flip).
      if (event.code === "Space" && target?.closest("button, a")) return;
      if (summary) return;
      if (!["Space", "ArrowLeft", "ArrowRight", "KeyS"].includes(event.code)) return;
      event.preventDefault();
      if (event.code === "Space") void flip();
      else if (event.code === "ArrowLeft") previous();
      else if (event.code === "ArrowRight") advance();
      else toggleStar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return <section className="min-h-[calc(100dvh-4rem)] bg-[#F8F9FC] text-slate-900">
    <header className="border-b border-slate-200/80 bg-white px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button className={`${toolbarButton} border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50`} onClick={async () => { if (await flush()) router.push("/flashcards"); }}><ArrowLeft className="size-3.5" />Danh sách bộ thẻ</button>
          <span aria-hidden="true" className="text-slate-300">•</span>
          <h1 title={deck.title} className="min-w-0 truncate text-xs font-extrabold uppercase tracking-wide sm:text-sm">{deck.title}</h1>
        </div>
        <div role="group" aria-label="Công cụ ôn tập" className="flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-slate-200/70 bg-slate-100/70 p-1">
          <button aria-pressed={filter === "all"} onClick={() => restart("all")} className={`${toolbarButton} ${filter === "all" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/70"}`}>Tất cả thẻ</button>
          <button aria-pressed={filter === "starred"} onClick={() => restart("starred")} className={`${toolbarButton} ${filter === "starred" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/70"}`}><Star className="size-3.5 text-amber-500" />Chỉ thẻ gắn sao ({starredCount})</button>
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-slate-200" />
          <button disabled={summary || queue.length < 2} className={`${toolbarButton} text-slate-500 hover:bg-white/70`} onClick={() => { setQueue(shuffleCards(queue)); setIndex(0); setFlipped(false); toast.success("Đã xáo trộn thẻ."); }}><Shuffle className="size-3.5" />Xáo trộn</button>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-4 sm:px-8 sm:py-6">
      {summary ? <div className={`${panelClass} text-center sm:!p-12`}>
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl border border-yellow-300 bg-[#FACC15] text-slate-950"><Trophy className="size-9" /></div>
        <p className={labelClass}>Hoàn thành lượt ôn</p>
        <h2 className="mt-3 text-3xl font-extrabold">Bạn đã ôn {queue.length} thẻ!</h2>
        <p className="mt-3 text-sm text-slate-500">Đã học được tính trong lượt này. Gắn sao những thẻ bạn muốn xem lại.</p>
        <div className="my-8 grid grid-cols-2 gap-4"><div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-6"><p className="text-4xl font-semibold tabular-nums text-emerald-600">{stats.done}</p><p className="mt-2 text-sm text-emerald-700">Đã học</p></div><div className="rounded-2xl border border-rose-200/60 bg-rose-50/70 p-6"><p className="text-4xl font-semibold tabular-nums text-rose-600">{reviewIds.length}</p><p className="mt-2 text-sm text-rose-700">Cần xem lại</p></div></div>
        <div className="flex flex-wrap justify-center gap-3"><button className={primaryClass} disabled={reviewIds.length === 0} onClick={() => restart("starred", reviewIds)}><RotateCcw className="size-4" />Ôn lại thẻ gắn sao</button>
          <button className={buttonClass} onClick={() => restart("all")}>Học lại từ đầu</button></div>
        <p className="mt-4 text-xs text-slate-400">Mỗi lượt học bắt đầu lại từ đầu; danh sách sao được giữ lại.</p>
      </div> : <>
        <ProgressBar value={stats.percent} label={`Lượt ôn này: ${stats.done}/${queue.length} thẻ đã học`} />
        {!card ? <FlashcardEmpty title={cards.length === 0 ? "Bộ thẻ chưa có nội dung" : filter === "starred" ? "Chưa có thẻ gắn sao" : "Không có thẻ cần ôn lại"} description="Chọn Tất cả thẻ để xem nội dung, hoặc quay về danh mục để chọn bộ thẻ khác." /> : <>
          <div className="relative [perspective:1200px]">
            <button aria-label={card.progress?.is_starred ? "Bỏ đánh dấu cần xem lại" : "Gắn sao: cần xem lại"} aria-pressed={card.progress?.is_starred ?? false} onClick={() => void toggleStar()} className={`${buttonClass} absolute right-4 top-4 z-10 !rounded-full !p-3 shadow-sm sm:right-6 sm:top-6`}><Star className={`size-4 ${card.progress?.is_starred ? "fill-amber-300 text-amber-500" : "text-slate-400"}`} /></button>
            <div key={card.id} role="button" tabIndex={0} aria-label={flipped ? "Mặt đáp án. Nhấn để xem câu hỏi." : "Mặt câu hỏi. Nhấn để xem đáp án."}
              onClick={() => void flip()} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void flip(); } }}
              className="grid cursor-pointer rounded-3xl outline-none transition-transform duration-500 ease-out motion-reduce:transition-none focus-visible:ring-4 focus-visible:ring-slate-300/60"
              style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              <div aria-hidden={flipped} className={`${questionSurfaceClass} col-start-1 row-start-1 flex min-h-96 min-w-0 flex-col rounded-3xl p-6 shadow-[0_16px_48px_-16px_rgba(37,99,235,0.2)] sm:min-h-[28rem] sm:p-10`} style={{ backfaceVisibility: "hidden" }}>
                <div className="mb-8 flex flex-wrap items-center gap-3 pr-12"><span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">Câu hỏi</span><span className={labelClass}>{index + 1} / {queue.length}</span></div>
                <div className="flex min-w-0 flex-1 items-center justify-center py-4"><FitMathText text={card.question} className="text-center font-semibold tracking-tight text-slate-800" /></div>
                <p className="mt-8 text-center text-xs font-medium text-slate-400">Nhấn để xem đáp án <span className="mx-1">·</span> <kbd className={kbdClass}>Space</kbd></p>
              </div>
<div aria-hidden={!flipped} className={`${answerSurfaceClass} col-start-1 row-start-1 flex min-h-96 min-w-0 flex-col rounded-3xl p-6 shadow-sm sm:min-h-[28rem] sm:p-10`} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #ffffff 0%, #fffff8 100%)" }}>
  <div className="mb-6 flex flex-wrap items-center gap-3 pr-12"><span className={badgeClass}>Đáp án</span><span className={labelClass}>{index + 1} / {queue.length}</span></div>
  
  <div className="flex min-w-0 flex-1 items-center justify-center py-4 px-2">
    <FitMathText text={card.answer} className="text-center text-xl font-bold text-slate-800 sm:text-2xl" />
  </div>

  <div className="mt-5 space-y-4">
    {card.note && <div className={`${noteClass} max-w-lg text-left border border-slate-100 bg-white/80 text-slate-700`}>
      <p className="mb-1.5 flex items-center gap-2 text-xs font-medium text-amber-600"><Lightbulb className="size-3.5 shrink-0 text-amber-500" />Mẹo ghi nhớ</p>
      <FitMathText text={card.note} compact />
    </div>}
    <p className="text-center text-xs font-medium text-slate-400">Gắn sao nếu bạn muốn xem lại thẻ này.</p>
  </div>
</div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button aria-label="Thẻ trước" disabled={index === 0} className={buttonClass} onClick={previous}><ArrowLeft className="size-4" /><span>Thẻ trước</span></button>
            <p className="text-center text-xs text-slate-500">Thẻ {index + 1} / {queue.length}</p>
            <button className={primaryClass} onClick={advance}><span>{stats.done === queue.length - 1 && !ratings[card.id] ? "Hoàn thành" : "Tiếp tục"}</span><ArrowRight className="size-4" /></button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-200/60 pt-5 text-xs font-medium text-slate-400">
            <span><kbd className={kbdClass}>Space</kbd> Xem đáp án</span><span><kbd className={kbdClass}>←</kbd> Thẻ trước</span><span><kbd className={kbdClass}>→</kbd> Tiếp tục</span><span><kbd className={kbdClass}>S</kbd> Cần xem lại</span>
          </div>
        </>}
      </>}
      <p role="status" className="text-center text-xs text-slate-500">
        {syncState === "error" ? <>Chưa lưu được danh sách sao. <button className="underline" onClick={() => void flush()}>Thử lưu lại</button></> : syncState === "saved" ? "Gắn sao để lưu vào danh sách cần xem lại." : "Đang lưu danh sách sao…"}
      </p>
    </div>
  </section>;
}
