"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";

import type {
  ExamAnswers,
  QuestionConfig,
} from "./types";

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
}: {
  config: QuestionConfig;

  savedAnswers?: ExamAnswers;
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

  const updateAnswers =
    useCallback(
      (
        updater: (
          previous: ExamAnswers
        ) => ExamAnswers
      ) => {
        setAnswers(
          (previous) => {
            const next =
              updater(previous);

            answersRef.current =
              next;

            return next;
          }
        );
      },
      []
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