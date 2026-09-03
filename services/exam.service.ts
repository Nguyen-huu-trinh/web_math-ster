import { examRepository } from "@/repositories/exam.repository";
import {
  AnswerKey,
  CreateExamDto,
  UpdateExamDto,
} from "@/types/exam";

import {
  regradeAttempt,
  type RegradeAttemptInput,
} from "@/lib/exam/regrade";

import {
  studentExamRepository,
} from "@/repositories/student-exam.repository";

import { adminClient } from "@/lib/supabase/admin";

export class ExamService {

  // =========================
  // Query
  // =========================

  async getAll() {
    return examRepository.getAll();
  }

  async getById(id: string) {
    return examRepository.getById(id);
  }

  async getAnswerKey(id: string) {
    return examRepository.getAnswerKey(id);
  }

  // =========================
  // Commands
  // =========================

  async create(
    teacherId: string,
    values: CreateExamDto
  ) {
    return examRepository.create(
      teacherId,
      values
    );
  }

  async update(
    id: string,
    values: UpdateExamDto
  ) {
    return examRepository.update(
      id,
      values
    );
  }

  // =========================
  // UPDATE ANSWER KEY
  // =========================

  async updateAnswerKey(
    id: string,
    answerKey: AnswerKey
  ) {
    // ========================================================
    // 1. LƯU ANSWER KEY MỚI
    // ========================================================

    const exam =
      await examRepository.updateAnswerKey(
        id,
        answerKey
      );

    // ========================================================
    // 2. LẤY CÁC ATTEMPT ĐÃ SUBMIT
    // ========================================================

const attempts =
  await studentExamRepository
    .getSubmittedAttemptsForRegrade(id);

console.log(
  "[REGRADE DEBUG] attempts:",
  {
    examId: id,
    count: attempts.length,
    attempts,
  }
);

    // ========================================================
    // 3. KHÔNG CÓ BÀI ĐÃ NỘP
    // ========================================================

    if (attempts.length === 0) {
      return exam;
    }

    // ========================================================
    // 4. REGRADE
    // ========================================================

    const results = attempts.map(
      (attempt) =>
        regradeAttempt(
          {
            attemptId: attempt.id,

            studentId:
              attempt.student_id,

            answers:
              attempt.answers,

            oldScore:
              attempt.score,

            oldPassed:
              attempt.is_passed,
          } satisfies RegradeAttemptInput,

          {
            answerKey:
              answerKey,

            questionConfig:
              exam.question_config,

            examType:
              exam.exam_type,

            category:
              exam.category,

            passingScore:
              Number(
                exam.attendance_min_score ?? 0
              ),
          }
        )
    );
    console.log(
  "[REGRADE DEBUG] results:",
  results
);

    // ========================================================
    // 5. UPDATE ATTEMPTS + POINTS
    // ========================================================



    for (const result of results) {

      // ------------------------------------------------------
      // Update score + is_passed
      // ------------------------------------------------------

 const {
  data: updatedAttempt,
  error: attemptError,
} =
  await adminClient
    .from("exam_attempts")
    .update({
      score:
        result.newScore,

      is_passed:
        result.newPassed,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      result.attemptId
    )
    .select(
      "id, score, is_passed"
    )
    .single();

console.log(
  "[REGRADE DEBUG] updated attempt:",
  {
    attemptId:
      result.attemptId,

    updatedAttempt,

    error:
      attemptError,
  }
);

if (attemptError) {
  throw attemptError;
}

      // ------------------------------------------------------
      // Điều chỉnh points nếu pass/fail thay đổi
      // ------------------------------------------------------

      if (
        result.pointCorrection !== 0
      ) {
      const {
  error: pointsError,
} =
  await adminClient.rpc(
    "adjust_student_points",
    {
      p_student_id:
        result.studentId,

      p_delta:
        result.pointCorrection,
    }
  );

if (pointsError) {
  throw pointsError;
}

        if (pointsError) {
          throw pointsError;
        }
      }
    }

    return exam;
  }

  async activate(id: string) {
    return examRepository.activate(id);
  }

  async deactivate(id: string) {
    return examRepository.deactivate(id);
  }

  async duplicate(
    id: string,
    teacherId: string
  ) {
    return examRepository.duplicate(
      id,
      teacherId
    );
  }

  async softDelete(id: string) {
    return examRepository.softDelete(id);
  }
}

export const examService =
  new ExamService();