"use client";

import { AnswerKey, QuestionConfig } from "@/types/exam";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  answerKey: AnswerKey;
  questionConfig: QuestionConfig;
  onChange: (value: AnswerKey) => void;
}

export function AnswerKeyEditor({
  answerKey,
  questionConfig,
  onChange,
}: Props) {
  function updateMC(index: number, value: string) {
    const next = [...answerKey.multipleChoice];
    next[index] = value.toUpperCase();

    onChange({
      ...answerKey,
      multipleChoice: next,
    });
  }

  function updateShort(index: number, value: string) {
    const next = [...answerKey.shortAnswer];
    next[index] = value;

    onChange({
      ...answerKey,
      shortAnswer: next,
    });
  }

  function updateTrueFalse(
    question: number,
    option: number,
    value: string
  ) {
    const next = [...answerKey.trueFalse];

    if (!next[question]) {
      next[question] = ["", "", "", ""];
    }

    next[question][option] = value.toUpperCase();

    onChange({
      ...answerKey,
      trueFalse: next,
    });
  }

  return (
    <div className="space-y-8">

      {/* Multiple Choice */}

      <Card>

        <CardContent className="space-y-4 p-6">

          <h3 className="font-semibold">
            Phần I - Trắc nghiệm
          </h3>

          <div className="grid grid-cols-5 gap-4">

            {Array.from({
              length: questionConfig.multipleChoice,
            }).map((_, index) => (

              <div key={index}>

                <Label>
                  Câu {index + 1}
                </Label>

                <Input
                  value={
                    answerKey.multipleChoice[index] ?? ""
                  }
                  onChange={(e) =>
                    updateMC(index, e.target.value)
                  }
                  placeholder="A"
                />

              </div>

            ))}

          </div>

        </CardContent>

      </Card>

      {/* True False */}

      <Card>

        <CardContent className="space-y-6 p-6">

          <h3 className="font-semibold">
            Phần II - Đúng / Sai
          </h3>

          {Array.from({
            length: questionConfig.trueFalse,
          }).map((_, q) => (

            <div key={q}>

              <Label className="mb-3 block">
                Câu {q + 1}
              </Label>

              <div className="grid grid-cols-4 gap-3">

                {[0,1,2,3].map((option)=>(
                  <Input
                    key={option}
                    placeholder={`Ý ${option+1}`}
                    value={
                      answerKey.trueFalse[q]?.[option] ?? ""
                    }
                    onChange={(e)=>
                      updateTrueFalse(
                        q,
                        option,
                        e.target.value
                      )
                    }
                  />
                ))}

              </div>

            </div>

          ))}

        </CardContent>

      </Card>

      {/* Short Answer */}

      <Card>

        <CardContent className="space-y-4 p-6">

          <h3 className="font-semibold">
            Phần III - Trả lời ngắn
          </h3>

          <div className="grid grid-cols-4 gap-4">

            {Array.from({
              length: questionConfig.shortAnswer,
            }).map((_, index)=>(

              <div key={index}>

                <Label>
                  Câu {index+1}
                </Label>

                <Input
                  value={
                    answerKey.shortAnswer[index] ?? ""
                  }
                  onChange={(e)=>
                    updateShort(
                      index,
                      e.target.value
                    )
                  }
                />

              </div>

            ))}

          </div>

        </CardContent>

      </Card>

    </div>
  );
}