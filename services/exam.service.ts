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

   async getPrerequisites(examId: string) {
    return examRepository.getPrerequisites(
      examId
    );
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

    async addPrerequisite(
    examId: string,
    prerequisiteExamId: string
  ) {
    return examRepository.addPrerequisite(
      examId,
      prerequisiteExamId
    );
  }

  async removePrerequisite(
    examId: string,
    prerequisiteExamId: string
  ) {
    return examRepository.removePrerequisite(
      examId,
      prerequisiteExamId
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


    // ========================================================
    // 5. UPDATE ATTEMPTS + POINTS
    // ========================================================



    // One network request per 500 attempts; score and point correction commit
    // together within each batch. The RPC rejects stale attempt snapshots.
    for (let offset = 0; offset < results.length; offset += 500) {
      const batch = results.slice(offset, offset + 500).map(result => ({
        attempt_id: result.attemptId, student_id: result.studentId,
        old_score: result.oldScore, new_score: result.newScore,
        old_passed: result.oldPassed, new_passed: result.newPassed,
        point_correction: result.pointCorrection,
      }));
      const { error } = await adminClient.rpc("apply_exam_regrades", {
        p_exam_id: id, p_rows: batch,
      });
      if (error) throw error;
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