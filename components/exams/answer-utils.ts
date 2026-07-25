import { AnswerKey, QuestionConfig } from "@/types/exam";

export function createEmptyAnswerKey(
  config: QuestionConfig
): AnswerKey {
  return {
    multipleChoice: Array(config.multipleChoice).fill(""),

    trueFalse: Array.from(
      { length: config.trueFalse },
      () => Array(4).fill("")
    ),

    shortAnswer: Array(config.shortAnswer).fill(""),
  };
}

export function isAnswerKeyValid(
  key: AnswerKey,
  config: QuestionConfig
) {
  if (
    key.multipleChoice.length !==
    config.multipleChoice
  ) {
    return false;
  }

  if (
    key.trueFalse.length !==
    config.trueFalse
  ) {
    return false;
  }

  if (
    key.shortAnswer.length !==
    config.shortAnswer
  ) {
    return false;
  }

  for (const ans of key.multipleChoice) {
    if (!ans) return false;
  }

  for (const row of key.trueFalse) {
    if (row.length !== 4) return false;

    for (const item of row) {
      if (item === "") return false;
    }
  }

  for (const ans of key.shortAnswer) {
    if (!ans.trim()) return false;
  }

  return true;
}