"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

export function useMarkedQuestions() {
  const [
    markedQuestions,
    setMarkedQuestions,
  ] = useState<Set<string>>(
    () => new Set()
  );

  const toggleMark =
    useCallback(
      (key: string) => {
        setMarkedQuestions(
          (previous) => {
            const next =
              new Set(previous);

            if (next.has(key)) {
              next.delete(key);
            } else {
              next.add(key);
            }

            return next;
          }
        );
      },
      []
    );

  const clearMarks =
    useCallback(() => {
      setMarkedQuestions(
        new Set()
      );
    }, []);

  const isMarked =
    useCallback(
      (key: string) =>
        markedQuestions.has(key),
      [markedQuestions]
    );

  const count =
    markedQuestions.size;

  const markedKeys =
    useMemo(
      () =>
        Array.from(
          markedQuestions
        ),
      [markedQuestions]
    );

  return {
    markedQuestions,

    markedKeys,

    count,

    isMarked,

    toggleMark,

    clearMarks,
  };
}