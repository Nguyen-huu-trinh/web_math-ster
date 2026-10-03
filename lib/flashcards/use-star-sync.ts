"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updateCardStars } from "@/app/actions/flashcards";

// Coalesce repeated toggles; serialize requests so an older save cannot win.
export function useStarSync(deckId: string) {
  const pending = useRef(new Map<string, boolean>());
  const running = useRef<Promise<boolean> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [state, setState] = useState<"saved" | "pending" | "saving" | "error">("saved");

  const flush = useCallback((): Promise<boolean> => {
    clearTimeout(timer.current);
    if (running.current) return running.current;
    const work = async () => {
      while (pending.current.size) {
        const batch = Array.from(pending.current.entries()).slice(0, 200);
        setState("saving");
        try {
          const result = await updateCardStars(deckId, batch.map(([cardId, isStarred]) => ({ cardId, isStarred })));
          if (!result.ok) { setState("error"); return false; }
          for (const [id, value] of batch) {
            if (pending.current.get(id) === value) pending.current.delete(id);
          }
        } catch { setState("error"); return false; }
      }
      setState("saved");
      return true;
    };
    running.current = work().finally(() => { running.current = null; });
    return running.current;
  }, [deckId]);

  const enqueue = useCallback((id: string, starred: boolean) => {
    pending.current.set(id, starred);
    setState("pending");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 1000);
  }, [flush]);

  useEffect(() => {
    const interval = setInterval(() => { if (pending.current.size) void flush(); }, 10000);
    const onHidden = () => { if (document.visibilityState === "hidden") void flush(); };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (pending.current.size) { event.preventDefault(); event.returnValue = ""; }
    };
    const onOnline = () => void flush();
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("online", onOnline);
    return () => {
      clearInterval(interval); clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("online", onOnline);
      void flush();
    };
  }, [flush]);

  return { enqueue, flush, state };
}
