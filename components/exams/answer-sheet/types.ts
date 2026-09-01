export interface ExamAnswers {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[][];
}

export interface QuestionConfig {
  multipleChoice: number;
  trueFalse: number;
  shortAnswer: number;
}

export interface AnswerSheetProps {
  attempt: any;
  exam: any;
  remainingSeconds: number;
  savedAnswers: ExamAnswers;

  review?: boolean;

  viewerRole?:
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";

  returnUrl?: string;
}

export interface ExamResultData {
  score: number;
  passed: boolean;
}

export const DEFAULT_QUESTION_CONFIG: QuestionConfig = {
  multipleChoice: 0,
  trueFalse: 0,
  shortAnswer: 0,
};

export const MULTIPLE_CHOICE_OPTIONS = [
  "A",
  "B",
  "C",
  "D",
] as const;

export const TRUE_FALSE_OPTIONS = [
  "Đ",
  "S",
] as const;

export const SHORT_ANSWER_OPTIONS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "-",
  ".",
] as const;

export const SHORT_ANSWER_COLUMNS = 4;