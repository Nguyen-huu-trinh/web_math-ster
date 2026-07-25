import { createClient } from "@/lib/supabase/server";

export class StudentExamRepository {
  async getMyExams(studentId: string) {
    const supabase = await createClient();

    // 1. Lấy danh sách khóa học học sinh đang học
    const { data: enrollments, error: enrollError } = await supabase
      .from("course_students")
      .select("course_id")
      .eq("student_id", studentId);

    if (enrollError) throw enrollError;

    const courseIds = enrollments.map((x) => x.course_id);

    if (courseIds.length === 0) return [];

    // 2. Lấy toàn bộ đề của các khóa học
    const { data: exams, error: examError } = await supabase
      .from("exams")
      .select(`
        *,
        courses(
          id,
          name
        )
      `)
      .in("course_id", courseIds)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (examError) throw examError;

    if (!exams?.length) return [];

    const examIds = exams.map((e) => e.id);

    // 3. Lấy toàn bộ lịch sử làm bài
    const { data: attempts, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("student_id", studentId)
      .in("exam_id", examIds);

    if (attemptError) throw attemptError;

    return exams.map((exam) => {
      const examAttempts = attempts.filter(
        (a) => a.exam_id === exam.id
      );

      const lastAttempt =
        examAttempts.length > 0
          ? examAttempts.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0]
          : null;

      const attemptCount = examAttempts.length;

      const canStart =
        attemptCount <
        (exam.max_attempts ?? 1);

      let status = "NOT_STARTED";

      if (lastAttempt) {
        if (exam.category === "ATTENDANCE") {
          status = lastAttempt.is_passed
            ? "PASSED"
            : "FAILED";
        } else {
          status = "DONE";
        }
      }

      return {
        id: exam.id,

        title: exam.title,

        description: exam.description,

        category: exam.category,

        examType: exam.exam_type,

        duration: exam.duration_minutes,

        courseId: exam.course_id,

        courseName:
          exam.courses?.name ?? "",

        maxAttempts:
          exam.max_attempts ?? 1,

        attempts: attemptCount,

        lastScore:
          lastAttempt?.score ?? null,

        lastAttemptAt:
          lastAttempt?.submitted_at ??
          null,

        status,

        canStart,

        canRetake: canStart,

        attendanceMinScore:
          exam.attendance_min_score,

        showAnswer:
          exam.show_answer,

        examFile:
          exam.exam_file_url,
      };
    });
  }

  // =====================================================
// START EXAM
// =====================================================

async startExam(
  
  studentId: string,
  examId: string,
) {
  const supabase = await createClient();

  // ===========================
  // Lấy thông tin đề
  // ===========================

  const { data: exam, error: examError } =
    await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

  if (examError) throw examError;

  if (!exam.is_active) {
    throw new Error("Đề chưa mở.");
  }

  if (exam.status !== "OPEN") {
    throw new Error("Đề đang khóa.");
  }

  const now = new Date();

  if (
    exam.start_at &&
    now < new Date(exam.start_at)
  ) {
    throw new Error("Đề chưa bắt đầu.");
  }

  if (
    exam.end_at &&
    now > new Date(exam.end_at)
  ) {
    throw new Error("Đề đã kết thúc.");
  }

  // ===========================
  // Kiểm tra số lượt
  // ===========================

  const {
    data: oldAttempts,
    error: attemptError,
  } = await supabase
    .from("exam_attempts")
    .select("id")
    .eq("exam_id", examId)
    .eq("student_id", studentId);

  if (attemptError) throw attemptError;

  const attemptNumber =
    (oldAttempts?.length ?? 0) + 1;

  if (
    exam.max_attempts &&
    attemptNumber > exam.max_attempts
  ) {
    throw new Error("Bạn đã hết lượt làm.");
  }

  // ===========================
  // Tạo attempt
  // ===========================

  const {
    data: attempt,
    error,
  } = await supabase
    .from("exam_attempts")
    .insert({
      exam_id: examId,
      student_id: studentId,
      attempt_number: attemptNumber,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // ===========================
  // Lấy danh sách câu hỏi
  // ===========================

  const {
    data: questions,
    error: questionError,
  } = await supabase
    .from("exam_questions")
    .select("id")
    .eq("exam_id", examId);

  if (questionError) throw questionError;

  // ===========================
  // Tạo sẵn exam_answers
  // ===========================

  if (questions && questions.length > 0) {

    const rows = questions.map((q) => ({
      attempt_id: attempt.id,
      question_id: q.id,
      answer: null,
      earned_score: 0,
      is_correct: false,
    }));

    const { error: answerError } =
      await supabase
        .from("exam_answers")
        .insert(rows);

    if (answerError) {
      throw answerError;
    }
  }

  return attempt;
}
async getAttemptDetail(
  studentId: string,
  attemptId: string
) {

  const supabase =
    await createClient();

  // Attempt

  const {
    data: attempt,
    error: attemptError,
  } = await supabase

    .from("exam_attempts")

    .select("*")

    .eq("id", attemptId)

    .eq("student_id", studentId)

    .single();

  if (attemptError) {
    throw attemptError;
  }
 
  // Exam

  const {
    data: exam,
    error: examError,
  } = await supabase

    .from("exams")

    .select("*")

    .eq("id", attempt.exam_id)

    .single();

  if (examError) {
    throw examError;
  }

  // Questions

  const {
    data: questions,
    error: questionError,
  } = await supabase

    .from("exam_questions")

    .select("*")

    .eq("exam_id", exam.id)

    .order("question_number");

  if (questionError) {
    throw questionError;
  }

  return {

    attempt,

    exam,

    questions,

    pdfUrl:
      exam.exam_file_url,

    remainingSeconds:
      exam.duration_minutes * 60,

  };

}


async submitAttempt(
  studentId: string,
  attemptId: string,
  answers: Record<string, any>
) {
  const supabase = await createClient();

  // ==========================
  // Attempt
  // ==========================

  const { data: attempt, error: attemptError } =
    await supabase
      .from("exam_attempts")
      .select(`
        *,
        exams(*)
      `)
      .eq("id", attemptId)
      .eq("student_id", studentId)
      .single();

  if (attemptError) throw attemptError;

  if (attempt.submitted_at) {
    throw new Error("Bài thi đã được nộp.");
  }

  // ==========================
  // Questions
  // ==========================

  const {
    data: questions,
    error: questionError,
  } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("exam_id", attempt.exam_id)
    .order("question_number");

  if (questionError) throw questionError;

  let totalScore = 0;

  // ==========================
  // Update exam_answers
  // ==========================

  for (const q of questions ?? []) {

    const studentAnswer =
      answers[q.id] ?? null;

    const correct =
      JSON.stringify(studentAnswer) ===
      JSON.stringify(q.answer);

    const earned =
      correct
        ? Number(q.score)
        : 0;

    totalScore += earned;

    await supabase
      .from("exam_answers")
      .update({
        answer: studentAnswer,
        earned_score: earned,
        is_correct: correct,
      })
      .eq("attempt_id", attemptId)
      .eq("question_id", q.id);

  }

  // ==========================
  // Score
  // ==========================

  const maxScore =
    questions?.reduce(
      (sum, q) => sum + Number(q.score),
      0
    ) ?? 0;

  const percent =
    maxScore === 0
      ? 0
      : Number(
          (
            (totalScore / maxScore) *
            100
          ).toFixed(2)
        );

  const passed =
    attempt.exams.category === "ATTENDANCE"
      ? percent >=
        Number(
          attempt.exams.attendance_min_score ?? 0
        )
      : true;

  // ==========================
  // Finish attempt
  // ==========================

  await supabase
    .from("exam_attempts")
    .update({
      submitted_at:
        new Date().toISOString(),
      score: percent,
      is_passed: passed,
    })
    .eq("id", attemptId);

  // ==========================
  // Return answers
  // ==========================

  return {
    score: percent,

    passed,

    showAnswer:
      attempt.exams.show_answer,

    answers:
      attempt.exams.show_answer
        ? questions.map((q) => ({
            questionId: q.id,
            correctAnswer: q.answer,
          }))
        : null,
  };
}
}

export const studentExamRepository =
  new StudentExamRepository();