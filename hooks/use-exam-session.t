import { useState } from "react";

export interface ExamAnswerState {

    multipleChoice: string[];

    trueFalse: string[][];

    shortAnswer: string[][];

}

export function useExamSession(

    questionConfig: {

        multiple_choice: number;

        true_false: number;

        short_answer: number;

    }

) {

    const [answers, setAnswers] =

        useState<ExamAnswerState>({

            multipleChoice:

                Array.from(

                    {

                        length:

                            questionConfig.multiple_choice,

                    },

                    () => ""

                ),

            trueFalse:

                Array.from(

                    {

                        length:

                            questionConfig.true_false,

                    },

                    () =>

                        Array(4).fill("")

                ),

            shortAnswer:

                Array.from(

                    {

                        length:

                            questionConfig.short_answer,

                    },

                    () =>

                        Array(4).fill("")

                ),

        });

    return {

        answers,

        setAnswers,

    };

}