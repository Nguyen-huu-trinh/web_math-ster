import { useRef } from "react";

import {
  useSaveAnswer,
} from "@/hooks/use-save-answer";

interface ExamAnswers {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[][];
}

export function useAutosave(
  attemptId?: string
) {
  const mutation =
    useSaveAnswer();

  const timeout =
    useRef<NodeJS.Timeout | null>(
      null
    );

  function save(
    answers: ExamAnswers
  ) {
    if (!attemptId) return;

    if (timeout.current) {
      clearTimeout(
        timeout.current
      );
    }

    timeout.current =
      setTimeout(() => {

        mutation.mutate({

          attemptId,

          answers,

        });

      }, 500);
  }

  return {

    save,

    saving:
      mutation.isPending,

  };
}