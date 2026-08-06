export interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionType:
    | "MULTIPLE_CHOICE"
    | "TRUE_FALSE"
    | "SHORT_ANSWER";
}

export interface SavedExamAnswer {
  questionId: string;
  answer: string[];
}

export interface ExamSessionData {
  questions: ExamQuestion[];
  savedAnswers: SavedExamAnswer[];
  remainingSeconds: number;
}