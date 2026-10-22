import { createClient } from "@/lib/supabase/server";

export class GradingService {
  async gradeAttempt(attemptId: string) {
    const supabase = await createClient();

    const { data: answers, error } = await supabase
      .from("student_answers")
      .select(`
        *,
        questions(
          id,
          question_type,
          score
        ),
        answers(
          id,
          is_correct
        )
      `)
      .eq("attempt_id", attemptId);

    if (error) throw error;

    let totalScore = 0;
    const details = [];

    for (const item of answers) {
      let earned = 0;

      switch (item.questions.question_type) {
        case "MULTIPLE_CHOICE":
          earned = item.answers?.is_correct
            ? item.questions.score
            : 0;
          break;

        case "TRUE_FALSE":
          earned = item.answers?.is_correct
            ? item.questions.score
            : 0;
          break;

        case "SHORT_ANSWER":
          earned = 0;
          break;
      }

      totalScore += earned;

      details.push({
          attempt_id: attemptId,
          question_id: item.question_id,
          score: earned,
          is_correct: earned > 0,
        });
    }

    if (details.length) {
      const { error: detailError } = await supabase.from("result_details").insert(details);
      if (detailError) throw detailError;
    }

    const { error: attemptError } = await supabase
      .from("exam_attempts")
      .update({
        score: totalScore,
        graded_at: new Date().toISOString(),
      })
      .eq("id", attemptId);
    if (attemptError) throw attemptError;

    return {
      score: totalScore,
    };
  }
}

export const gradingService =
  new GradingService();
