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

      await supabase
        .from("result_details")
        .insert({
          attempt_id: attemptId,
          question_id: item.question_id,
          score: earned,
          is_correct: earned > 0,
        });
    }

    await supabase
      .from("exam_attempts")
      .update({
        score: totalScore,
        graded_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    return {
      score: totalScore,
    };
  }
}

export const gradingService =
  new GradingService();