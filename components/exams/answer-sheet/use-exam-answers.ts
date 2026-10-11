"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ExamAnswers,
  QuestionConfig,
} from "./types";
import { draftKey, readExamDraft } from "@/lib/exam/submit/client";

function cloneAnswers(
  answers: ExamAnswers
): ExamAnswers {
  return {
    multipleChoice: [
      ...answers.multipleChoice,
    ],

    trueFalse:
      answers.trueFalse.map(
        (row) => [...row]
      ),

    shortAnswer:
      answers.shortAnswer.map(
        (row) => [...row]
      ),
  };
}

function createEmptyAnswers(
  config: QuestionConfig
): ExamAnswers {
  return {
    multipleChoice:
      Array(
        config.multipleChoice
      ).fill(""),

    trueFalse:
      Array.from(
        {
          length:
            config.trueFalse,
        },
        () => ["", "", "", ""]
      ),

    shortAnswer:
      Array.from(
        {
          length:
            config.shortAnswer,
        },
        () => ["", "", "", ""]
      ),
  };
}

export function useExamAnswers({
  config,
  savedAnswers,
  draftAttemptId,
}: {
  config: QuestionConfig;

  savedAnswers?: ExamAnswers;
  draftAttemptId?: string;
}) {
  const [
    answers,
    setAnswers,
  ] = useState<ExamAnswers>(() => {
    if (savedAnswers) {
      return cloneAnswers(
        savedAnswers
      );
    }

    return createEmptyAnswers(
      config
    );
  });

  const answersRef =
    useRef(answers);

  useEffect(() => {
    if (!draftAttemptId) return;
    const draft = readExamDraft(draftAttemptId);
    if (!draft || draft.multipleChoice.length !== config.multipleChoice ||
        draft.trueFalse.length !== config.trueFalse || draft.shortAnswer.length !== config.shortAnswer ||
        ![...draft.trueFalse, ...draft.shortAnswer].every((row) => row.length === 4)) return;
    answersRef.current = cloneAnswers(draft);
    setAnswers(answersRef.current);
  }, [draftAttemptId, config.multipleChoice, config.trueFalse, config.shortAnswer]);

  const updateAnswers =
    useCallback(
      (
        updater: (
          previous: ExamAnswers
        ) => ExamAnswers
      ) => {
        // Submission can run before React commits a queued render (for example,
        // on timeout or fullscreen exit). Keep the payload current synchronously.
        const next = updater(answersRef.current);
        answersRef.current = next;
        setAnswers(next);
        if (draftAttemptId) {
          try { localStorage.setItem(draftKey(draftAttemptId), JSON.stringify({ answers: next })); }
          catch { /* Submission also attempts to back up the final payload. */ }
        }
      },
      [draftAttemptId]
    );

  const chooseMultipleChoice =
    useCallback(
      (
        questionIndex: number,
        value: string
      ) => {
        updateAnswers(
          (previous) => {
            const next =
              cloneAnswers(
                previous
              );

            next.multipleChoice[
              questionIndex
            ] =
              next.multipleChoice[
                questionIndex
              ] === value
                ? ""
                : value;

            return next;
          }
        );
      },
      [updateAnswers]
    );

  const chooseTrueFalse =
    useCallback(
      (
        questionIndex: number,
        columnIndex: number,
        value: string
      ) => {
        updateAnswers(
          (previous) => {
            const next =
              cloneAnswers(
                previous
              );

            next.trueFalse[
              questionIndex
            ][columnIndex] =
              next.trueFalse[
                questionIndex
              ][columnIndex] === value
                ? ""
                : value;

            return next;
          }
        );
      },
      [updateAnswers]
    );

  const chooseShortAnswer =
    useCallback(
      (
        questionIndex: number,
        columnIndex: number,
        value: string
      ) => {
        updateAnswers(
          (previous) => {
            const next =
              cloneAnswers(
                previous
              );

            next.shortAnswer[
              questionIndex
            ][columnIndex] =
              next.shortAnswer[
                questionIndex
              ][columnIndex] === value
                ? ""
                : value;

            return next;
          }
        );
      },
      [updateAnswers]
    );

  const answeredCount =
    answers.multipleChoice.filter(
      (value) =>
        value !== ""
    ).length +

    answers.trueFalse.filter(
      (row) =>
        row.every(
          (value) =>
            value !== ""
        )
    ).length +

    answers.shortAnswer.filter(
      (row) =>
        row.some(
          (value) =>
            value !== ""
        )
    ).length;

  const totalQuestions =
    config.multipleChoice +
    config.trueFalse +
    config.shortAnswer;

  return {
    answers,

    answersRef,

    chooseMultipleChoice,

    chooseTrueFalse,

    chooseShortAnswer,

    answeredCount,

    totalQuestions,
  };
}
