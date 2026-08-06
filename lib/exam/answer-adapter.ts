interface Question {
  id: string;
  question_number: number;
  question_type: string;
}

interface AnswerState {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[][];
}

type SavedAnswerMap = Record<
  string,
  string[]
>;

export function createEmptyAnswers(
  questionConfig: any
): AnswerState {

  return {

    multipleChoice: Array(
      questionConfig.multipleChoice
    ).fill(""),

    trueFalse: Array.from(
      {
        length:
          questionConfig.trueFalse,
      },
      () => ["", "", "", ""]
    ),

    shortAnswer: Array.from(
      {
        length:
          questionConfig.shortAnswer,
      },
      () => ["", "", "", ""]
    ),

  };

}

export function restoreAnswers(

  questionConfig: any,

  questions: Question[],

  savedAnswers: SavedAnswerMap

): AnswerState {

  const state =
    createEmptyAnswers(
      questionConfig
    );

  let mc = 0;
  let tf = 0;
  let sa = 0;

  for (const q of questions) {

    const answer =
      savedAnswers[q.id];

    if (!answer) {

      switch (
        q.question_type
      ) {

        case "MULTIPLE_CHOICE":
          mc++;
          break;

        case "TRUE_FALSE":
          tf++;
          break;

        case "SHORT_ANSWER":
          sa++;
          break;

      }

      continue;

    }

    switch (
      q.question_type
    ) {

      case "MULTIPLE_CHOICE":

        state.multipleChoice[
          mc
        ] =
          answer[0] ?? "";

        mc++;

        break;

      case "TRUE_FALSE":

       state.trueFalse[tf]=[
    answer[0] ?? "",
    answer[1] ?? "",
    answer[2] ?? "",
    answer[3] ?? "",
];

        tf++;

        break;

      case "SHORT_ANSWER":

        state.shortAnswer[sa]=[
    answer[0] ?? "",
    answer[1] ?? "",
    answer[2] ?? "",
    answer[3] ?? "",
];

        sa++;

        break;

    }

  }

  return state;

}