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
        id,
        title,
        description,
        category,
        exam_type,
        duration_minutes,
        course_id,
        max_attempts,
        attendance_min_score,
        show_answer,
        exam_file_url,
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
      .select("exam_id, score, is_passed, created_at, submitted_at")
      .eq("student_id", studentId)
      .in("exam_id", examIds);

    if (attemptError) throw attemptError;

    return exams.map((exam) => {
      const course = Array.isArray(exam.courses)
        ? exam.courses[0]
        : exam.courses;

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
          course?.name ?? "",

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
  examId: string,
  studentId: string
) {
  const supabase =
    await createClient();

  // ===========================
  // Lấy thông tin đề
  // ===========================

  const {
    data: exam,
    error: examError,
  } = await supabase
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
  // Resume nếu còn bài chưa nộp
  // ===========================

  const {
    data: currentAttempt,
  } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .is("submitted_at", null)
    .order("created_at", {
      ascending: false,
    })
    .maybeSingle();

  if (currentAttempt) {
    console.log(
      "Resume attempt:",
      currentAttempt.id
    );

    return currentAttempt;
  }

  // ===========================
  // Đếm số lần làm
  // ===========================

  const {
    data: oldAttempts,
    error: attemptError,
  } = await supabase
    .from("exam_attempts")
    .select("id")
    .eq("exam_id", examId)
    .eq("student_id", studentId);

  if (attemptError) {
    throw attemptError;
  }

  const attemptNumber =
    (oldAttempts?.length ?? 0) + 1;

  if (
    exam.max_attempts &&
    attemptNumber >
      exam.max_attempts
  ) {
    throw new Error(
      "Bạn đã hết lượt làm."
    );
  }

  // ===========================
  // Khởi tạo đáp án rỗng
  // ===========================

  const questionConfig =
    exam.question_config ?? {
      multipleChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
    };

  const emptyAnswers = {
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

  // ===========================
  // Tạo attempt mới
  // ===========================

  const {
    data: attempt,
    error,
  } = await supabase
    .from("exam_attempts")
    .insert({

      exam_id: examId,

      student_id: studentId,

      attempt_number:
        attemptNumber,

      started_at:
        new Date().toISOString(),

      duration_seconds:
        exam.duration_minutes * 60,

      answers:
        emptyAnswers,

    })
    .select()
    .single();

  if (error) {
    throw error;
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

// ==========================
// Saved Answers
// ==========================

const savedAnswers =
  attempt.answers ?? {
    multipleChoice: [],
    trueFalse: [],
    shortAnswer: [],
  };
  // ============================
// Remaining Time
// ============================

const startedAt =
  new Date(attempt.started_at).getTime();

const now =
  Date.now();

const duration =
  attempt.duration_seconds ??
  exam.duration_minutes * 60;

const elapsed =
  Math.floor(
    (now - startedAt) / 1000
  );

const remainingSeconds =
  Math.max(
    duration - elapsed,
    0
  );
  if (
  remainingSeconds <= 0 &&
  !attempt.submitted_at
) {

  await supabase
    .from("exam_attempts")
    .update({

      submitted_at:
        new Date().toISOString(),

    })
    .eq(
      "id",
      attempt.id
    );

}



return {

    attempt,

    exam,

    pdfUrl: exam.exam_file_url,

    remainingSeconds,

    savedAnswers,

};

}
async submitAttempt(
  studentId: string,
  attemptId: string,
  answers: Record<string, any>
)


{


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

  // const {
  //   data: questions,
  //   error: questionError,
  // } = await supabase
  //   .from("exam_questions")
  //   .select("*")
  //   .eq("exam_id", attempt.exam_id)
  //   .order("question_number");

  

  // // ==========================
  // // Score
  // // ==========================

  // const maxScore =
  //   questions?.reduce(
  //     (sum, q) => sum + Number(q.score),
  //     0
  //   ) ?? 0;

  // const percent =
  //   maxScore === 0
  //     ? 0
  //     : Number(
  //         (
  //           (totalScore / maxScore) *
  //           100
  //         ).toFixed(2)
  //       );

  // const passed =
  //   attempt.exams.category === "ATTENDANCE"
  //     ? percent >=
  //       Number(
  //         attempt.exams.attendance_min_score ?? 0
  //       )
  //     : true;

const answerKey =
  typeof attempt.exams.answer_key === "string"
    ? JSON.parse(attempt.exams.answer_key)
    : attempt.exams.answer_key;

let score = 0;

if (attempt.exams.exam_type === "MOET") {
  score = this.gradeTHPT(answerKey, answers);
} else {
  score = this.gradeCustom(answerKey, answers);
}

score = Number(score.toFixed(2));




const passed =
  attempt.exams.category === "ATTENDANCE"
    ? score >= Number(attempt.exams.attendance_min_score ?? 0)
    : true;
  // ==========================
  // Finish attempt
  // ==========================

  await supabase
    .from("exam_attempts")
    .update({
      submitted_at:
        new Date().toISOString(),
      score: score,
      is_passed: passed,
    })
    .eq("id", attemptId);

  // ==========================
  // Return answers
  // ==========================

  return {
    score: score,

    passed,

    showAnswer:
      attempt.exams.show_answer,

    answers:
      attempt.exams.show_answer
        ? answerKey
        : null
  };
}

private gradeTHPT(
  answerKey: any,
  answers: any
) {

  let score = 0;

  // ======================
  // PART I
  // ======================

  const mcKey = answerKey.multipleChoice ?? [];
  const mc = answers.multipleChoice ?? [];

  for (let i = 0; i < mcKey.length; i++) {
    if (mc[i] === mcKey[i]) {
      score += 0.25;
    }
  }

  // ======================
  // PART II
  // ======================

  const tfKey = answerKey.trueFalse ?? [];
  const tf = answers.trueFalse ?? [];

  for (let i = 0; i < tfKey.length; i++) {

    let correct = 0;

    for (let j = 0; j < 4; j++) {

      if (tf[i]?.[j] === tfKey[i]?.[j]) {
        correct++;
      }

    }

    switch (correct) {

      case 1:
        score += 0.1;
        break;

      case 2:
        score += 0.25;
        break;

      case 3:
        score += 0.5;
        break;

      case 4:
        score += 1;
        break;

    }

  }

  // ======================
  // PART III
  // ======================
const saKey = answerKey.shortAnswer ?? [];
const sa = answers.shortAnswer ?? [];

for (let i = 0; i < saKey.length; i++) {

  // Học sinh gửi lên là mảng ký tự
  const student = Array.isArray(sa[i])
    ? sa[i]
        .join("")
        .replace(/\s/g, "")
        .trim()
    : String(sa[i] ?? "")
        .replace(/\s/g, "")
        .trim();

  // Giáo viên lưu là chuỗi
  const correct = String(saKey[i] ?? "")
    .replace(/\s/g, "")
    .trim();

  if (student === correct) {
    score += 0.5;
  }
}
  return score;

}
private gradeCustom(
  answerKey: any,
  answers: any
) {
  let score = 0;

  // =====================================================
  // TỔNG SỐ CÂU CỦA ĐỀ CUSTOM
  // =====================================================

  const totalQuestions =
    this.getCustomTotalQuestions(answerKey);

  // Không có câu hỏi
  if (totalQuestions === 0) {
    return 0;
  }

  // Tổng điểm đề = 10 điểm
  // Mỗi câu có trọng số bằng nhau
  const point = 10 / totalQuestions;


  // =====================================================
  // PART I — MULTIPLE CHOICE
  // =====================================================

  const mcKey =
    answerKey.multipleChoice ?? [];

  const mc =
    answers.multipleChoice ?? [];

  for (
    let i = 0;
    i < mcKey.length;
    i++
  ) {
    if (
      mc[i] === mcKey[i]
    ) {
      score += point;
    }
  }


  // =====================================================
  // PART II — TRUE / FALSE
  // =====================================================

  const tfKey =
    answerKey.trueFalse ?? [];

  const tf =
    answers.trueFalse ?? [];

  for (
    let i = 0;
    i < tfKey.length;
    i++
  ) {
    let correct = 0;

    // Mỗi câu Đúng/Sai có 4 ý
    for (
      let j = 0;
      j < 4;
      j++
    ) {
      if (
        tf[i]?.[j] ===
        tfKey[i]?.[j]
      ) {
        correct++;
      }
    }

    /*
     * Quy tắc chấm:
     *
     * 0/4 → 0%
     * 1/4 → 10%
     * 2/4 → 25%
     * 3/4 → 50%
     * 4/4 → 100%
     */

    switch (correct) {
      case 1:
        score += point * 0.10;
        break;

      case 2:
        score += point * 0.25;
        break;

      case 3:
        score += point * 0.50;
        break;

      case 4:
        score += point;
        break;
    }
  }


  // =====================================================
  // PART III — SHORT ANSWER
  // =====================================================

  const saKey =
    answerKey.shortAnswer ?? [];

  const sa =
    answers.shortAnswer ?? [];

  for (
    let i = 0;
    i < saKey.length;
    i++
  ) {
    const student =
      this.normalizeShortAnswer(
        sa[i]
      );

    const correct =
      this.normalizeShortAnswer(
        saKey[i]
      );

    // Không cho câu trả lời rỗng được tính đúng
    if (
      student !== "" &&
      student === correct
    ) {
      score += point;
    }
  }


  return score;
}
private getCustomTotalQuestions(
    answerKey: any
) {
    const multipleChoice =
        answerKey.multipleChoice?.length ?? 0;

    const trueFalse =
        answerKey.trueFalse?.length ?? 0;

    const shortAnswer =
        answerKey.shortAnswer?.length ?? 0;

    return (
        multipleChoice +
        trueFalse +
        shortAnswer
    );
}

private normalizeShortAnswer(value: any): string {
    if (Array.isArray(value)) {
        return value
            .join("")
            .replace(/\s/g, "")
            .trim();
    }

    return String(value ?? "")
        .replace(/\s/g, "")
        .trim();
}

}

export const studentExamRepository =
  new StudentExamRepository();
