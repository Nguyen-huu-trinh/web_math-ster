import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export class StudentExamRepository {

  async adjustStudentPoints(
    examId: string,
    studentId: string,
    action: "increase" | "decrease"
  ) {
    const supabase = await createClient();

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, category")
      .eq("id", examId)
      .is("deleted_at", null)
      .single();

    if (examError || !exam) throw new Error("Không tìm thấy đề thi.");

    const delta =
      exam.category === "ATTENDANCE" ? 10 : exam.category === "PERIODIC" ? 50 : 0;

    if (delta === 0) throw new Error("Đề thi không thuộc loại được cộng/trừ điểm.");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, points")
      .eq("id", studentId)
      .single();

    if (profileError || !profile) throw new Error("Không tìm thấy hồ sơ học sinh.");

    const change = action === "increase" ? delta : -delta;
    const newPoints = Math.max(0, profile.points + change);

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", studentId)
      .select("id, points")
      .single();

    if (updateError) throw updateError;

    return {
      studentId,
      oldPoints: profile.points,
      newPoints: updatedProfile.points,
      change,
      category: exam.category,
    };
  }

  async getMyExams(studentId: string) {
    const supabase = await createClient();

    // 1. Tải song song thông tin profile và danh sách khóa học đang đăng ký
    const [profileRes, enrollmentsRes] = await Promise.all([
      supabase.from("profiles").select("created_at").eq("id", studentId).single(),
      supabase.from("course_students").select("course_id").eq("student_id", studentId),
    ]);

    if (profileRes.error || !profileRes.data) throw new Error("Không tìm thấy hồ sơ học sinh.");
    if (enrollmentsRes.error) throw enrollmentsRes.error;

    const courseIds = enrollmentsRes.data.map((x) => x.course_id);
    if (courseIds.length === 0) return [];

    // 2. Lấy danh sách đề thi (Chỉ chọn các trường tinh gọn cần thiết cho UI)
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
        exam_duration_days,
        status,
        is_active,
        courses(name)
      `)
      .in("course_id", courseIds)
      .is("deleted_at", null)
      .in("status", ["OPEN", "LOCKED"])
      .order("created_at", { ascending: false });

    if (examError || !exams?.length) return [];

    const examIds = exams.map((e) => e.id);

// 3. Tải lịch sử làm bài
    const { data: attempts, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("id, exam_id, score, is_passed, created_at, submitted_at")
      .eq("student_id", studentId)
      .in("exam_id", examIds);

    if (attemptError) throw attemptError;

    // Định nghĩa Type rõ ràng cho Attempt Item
    type AttemptItem = NonNullable<typeof attempts>[number];
    const attemptsByExam = new Map<string, AttemptItem[]>();

    (attempts ?? []).forEach((att) => {
      const list = attemptsByExam.get(att.exam_id) || [];
      list.push(att);
      attemptsByExam.set(att.exam_id, list);
    });

    const studentCreatedAt = new Date(profileRes.data.created_at).getTime();
    const nowTime = Date.now();
    const daysElapsed = Math.floor((nowTime - studentCreatedAt) / (86400 * 1000));

    return exams.map((exam) => {
      const course = Array.isArray(exam.courses) ? exam.courses[0] : exam.courses;
      const examAttempts = attemptsByExam.get(exam.id) || [];

      // Sắp xếp tìm attempt mới nhất
      let lastAttempt = null;
      if (examAttempts.length > 0) {
        lastAttempt = examAttempts.reduce((prev, current) =>
          new Date(current.created_at).getTime() > new Date(prev.created_at).getTime()
            ? current
            : prev
        );
      }

      const attemptCount = examAttempts.length;
      const hasSubmittedAttempt = examAttempts.some((a) => a.submitted_at !== null);
      const hasUnsubmittedAttempt = examAttempts.some((a) => a.submitted_at === null);

      let periodicDaysRemaining: number | null = null;
      if (
        exam.category === "PERIODIC" &&
        exam.status === "OPEN" &&
        exam.exam_duration_days !== null &&
        !hasSubmittedAttempt
      ) {
        periodicDaysRemaining = exam.exam_duration_days - daysElapsed;
      }

      const canStart =
        exam.status === "OPEN" &&
        exam.is_active === true &&
        !hasUnsubmittedAttempt &&
        attemptCount < (exam.max_attempts ?? 1);

      let status: "NOT_STARTED" | "PASSED" | "FAILED" | "DONE" | "LOCKED" = "NOT_STARTED";

      if (exam.status === "LOCKED" || hasUnsubmittedAttempt) {
        status = "LOCKED";
      } else if (lastAttempt) {
        status = lastAttempt.is_passed ? "PASSED" : "FAILED";
      }

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        category: exam.category,
        examType: exam.exam_type,
        duration: exam.duration_minutes,
        inProgress: hasUnsubmittedAttempt,
        courseId: exam.course_id,
        courseName: course?.name ?? "",
        maxAttempts: exam.max_attempts ?? 1,
        attempts: attemptCount,
        lastScore: lastAttempt?.score ?? null,
        lastAttemptAt: lastAttempt?.submitted_at ?? null,
        lastAttemptId: lastAttempt?.id ?? null,
        status,
        canStart,
        canRetake: canStart,
        attendanceMinScore: exam.attendance_min_score,
        showAnswer: exam.show_answer,
        periodicDaysRemaining,
      };
    });
  }

  async startExam(examId: string, studentId: string) {
    const supabase = await createClient();

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, is_active, status, start_at, end_at, duration_minutes, max_attempts, question_config")
      .eq("id", examId)
      .single();

    if (examError || !exam) throw new Error("Không tìm thấy đề thi.");
    if (!exam.is_active) throw new Error("Đề chưa mở.");
    if (exam.status !== "OPEN") throw new Error("Đề đã khóa.");

    const now = new Date();
    if (exam.start_at && now < new Date(exam.start_at)) throw new Error("Đề chưa bắt đầu.");
    if (exam.end_at && now > new Date(exam.end_at)) throw new Error("Đề đã kết thúc.");

// ===========================
    // KIỂM TRA ATTEMPT ĐANG LÀM
    // ===========================

    const {
      data: existingAttempt,
      error: existingAttemptError,
    } = await adminClient
      .from("exam_attempts")
      .select("id")
      .eq("exam_id", examId)
      .eq("student_id", studentId)
      .is("submitted_at", null)
      .maybeSingle<{ id: string }>(); // Bổ sung Generic Type { id: string } ở đây

    if (existingAttemptError) {
      throw existingAttemptError;
    }

    if (existingAttempt) {
      // Định nghĩa kiểu rõ ràng cho Custom Error
      type CustomExamError = Error & {
        code?: string;
        attemptId?: string;
      };

      const error = new Error(
        "Bạn đã có một lượt làm bài chưa nộp."
      ) as CustomExamError;

      error.code = "EXAM_IN_PROGRESS";
      error.attemptId = existingAttempt.id; // Hết lỗi 'id' does not exist

      throw error;
    }

// Đếm số lượt đã làm
    const { count, error: countError } = await supabase
      .from("exam_attempts")
      .select("id", { count: "exact", head: true })
      .eq("exam_id", examId)
      .eq("student_id", studentId);

    if (countError) throw countError;

    const attemptNumber = (count ?? 0) + 1;
    if (exam.max_attempts && attemptNumber > exam.max_attempts) {
      throw new Error("Bạn đã hết lượt làm.");
    }

    const questionConfig = exam.question_config ?? { multipleChoice: 0, trueFalse: 0, shortAnswer: 0 };
    const emptyAnswers = {
      multipleChoice: Array(questionConfig.multipleChoice).fill(""),
      trueFalse: Array.from({ length: questionConfig.trueFalse }, () => ["", "", "", ""]),
      shortAnswer: Array.from({ length: questionConfig.shortAnswer }, () => ["", "", "", ""]),
    };

    const { data: attempt, error } = await supabase
      .from("exam_attempts")
      .insert({
        exam_id: examId,
        student_id: studentId,
        attempt_number: attemptNumber,
        started_at: new Date().toISOString(),
        duration_seconds: exam.duration_minutes * 60,
        answers: emptyAnswers,
      })
      .select()
      .single();

    if (error) throw error;
    return attempt;
  }

  async getTeacherAttemptDetail(attemptId: string) {
    const supabase = await createClient();

    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptError || !attempt) throw new Error(`Không tìm thấy bài làm ${attemptId}`);

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", attempt.exam_id)
      .single();

    if (examError) throw examError;

    return {
      attempt,
      exam,
      pdfUrl: exam.exam_file_url,
      remainingSeconds: 0,
      savedAnswers: attempt.answers ?? { multipleChoice: [], trueFalse: [], shortAnswer: [] },
    };
  }

  async getPeriodicProgress(studentId: string) {
    const supabase = await createClient();

    const { data: exams, error: examsError } = await supabase
      .from("exams")
      .select("id, title, category")
      .eq("category", "PERIODIC")
      .is("deleted_at", null);

    if (examsError || !exams?.length) return [];

    const examIds = exams.map((exam) => exam.id);

    const { data: attempts, error: attemptsError } = await supabase
      .from("exam_attempts")
      .select("id, exam_id, score, submitted_at, created_at")
      .eq("student_id", studentId)
      .in("exam_id", examIds)
      .not("score", "is", null)
      .order("submitted_at", { ascending: true });

    if (attemptsError) throw attemptsError;

    return (attempts ?? []).map((attempt, index) => {
      const exam = exams.find((item) => item.id === attempt.exam_id);
      return {
        attemptId: attempt.id,
        examId: attempt.exam_id,
        examTitle: exam?.title ?? "Bài kiểm tra",
        score: Number(attempt.score),
        date: attempt.submitted_at ?? attempt.created_at,
        attemptNumber: index + 1,
      };
    });
  }

  async getAttemptDetail(studentId: string, attemptId: string) {
    const supabase = await createClient();

    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (attemptError || !attempt) throw new Error(`Không tìm thấy attempt ${attemptId}`);

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", attempt.exam_id)
      .single();

    if (examError) throw examError;

    const startedAt = new Date(attempt.started_at).getTime();
    const duration = attempt.duration_seconds ?? exam.duration_minutes * 60;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);

    return {
      attempt,
      exam,
      pdfUrl: exam.exam_file_url,
      remainingSeconds: Math.max(duration - elapsed, 0),
      savedAnswers: attempt.answers ?? { multipleChoice: [], trueFalse: [], shortAnswer: [] },
    };
  }

  async submitAttempt(studentId: string, attemptId: string, answers: Record<string, any>) {
    const supabase = await createClient();

    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .select("*, exams(*)")
      .eq("id", attemptId)
      .eq("student_id", studentId)
      .single();

    if (attemptError) throw attemptError;

    const startedAt = new Date(attempt.started_at).getTime();
    const duration = attempt.duration_seconds ?? attempt.exams.duration_minutes * 60;
    const expiresAt = startedAt + duration * 1000;
    const isExpired = Date.now() >= expiresAt;

    const answerKey = typeof attempt.exams.answer_key === "string"
      ? JSON.parse(attempt.exams.answer_key)
      : attempt.exams.answer_key;

    let score = attempt.exams.exam_type === "MOET"
      ? this.gradeTHPT(answerKey, answers)
      : this.gradeCustom(answerKey, answers);

    score = Number(score.toFixed(2));
    const passed = score >= Number(attempt.exams.attendance_min_score ?? 0);
    const submittedAt = isExpired ? new Date(expiresAt).toISOString() : new Date().toISOString();

    const { data: updatedAttempt, error: updateError } = await supabase
      .from("exam_attempts")
      .update({ answers, submitted_at: submittedAt, score, is_passed: passed })
      .eq("id", attemptId)
      .eq("student_id", studentId)
      .is("submitted_at", null)
      .select("id, score, is_passed, submitted_at")
      .maybeSingle();

    if (updateError) throw updateError;

    if (!updatedAttempt) {
      const { data: existingAttempt } = await supabase
        .from("exam_attempts")
        .select("score, is_passed, submitted_at, answers")
        .eq("id", attemptId)
        .eq("student_id", studentId)
        .maybeSingle();

      return {
        score: existingAttempt?.score ?? 0,
        passed: existingAttempt?.is_passed ?? false,
        alreadySubmitted: true,
        showAnswer: attempt.exams.show_answer,
        answers: attempt.exams.show_answer ? answerKey : null,
        answerKey: attempt.exams.show_answer ? answerKey : null,
      };
    }

    const pointDelta = attempt.exams.category === "ATTENDANCE"
      ? (passed ? 10 : -10)
      : (passed ? 50 : -50);

    await supabase.rpc("adjust_student_points", { p_student_id: studentId, p_delta: pointDelta });

    return {
      score,
      passed,
      alreadySubmitted: false,
      showAnswer: attempt.exams.show_answer,
      answers,
      answerKey: attempt.exams.show_answer ? answerKey : null,
    };
  }

  private gradeTHPT(answerKey: any, answers: any) {
    let score = 0;
    const mcKey = answerKey.multipleChoice ?? [];
    const mc = answers.multipleChoice ?? [];
    for (let i = 0; i < mcKey.length; i++) {
      if (mc[i] === mcKey[i]) score += 0.25;
    }

    const tfKey = answerKey.trueFalse ?? [];
    const tf = answers.trueFalse ?? [];
    for (let i = 0; i < tfKey.length; i++) {
      let correct = 0;
      for (let j = 0; j < 4; j++) {
        if (tf[i]?.[j] === tfKey[i]?.[j]) correct++;
      }
      if (correct === 1) score += 0.1;
      else if (correct === 2) score += 0.25;
      else if (correct === 3) score += 0.5;
      else if (correct === 4) score += 1;
    }

    const saKey = answerKey.shortAnswer ?? [];
    const sa = answers.shortAnswer ?? [];
    for (let i = 0; i < saKey.length; i++) {
      const student = this.normalizeShortAnswer(sa[i]);
      const correct = this.normalizeShortAnswer(saKey[i]);
      if (student === correct && student !== "") score += 0.5;
    }
    return score;
  }

  private gradeCustom(answerKey: any, answers: any) {
    let score = 0;
    const totalQuestions = this.getCustomTotalQuestions(answerKey);
    if (totalQuestions === 0) return 0;
    const point = 10 / totalQuestions;

    const mcKey = answerKey.multipleChoice ?? [];
    const mc = answers.multipleChoice ?? [];
    for (let i = 0; i < mcKey.length; i++) {
      if (mc[i] === mcKey[i]) score += point;
    }

    const tfKey = answerKey.trueFalse ?? [];
    const tf = answers.trueFalse ?? [];
    for (let i = 0; i < tfKey.length; i++) {
      let correct = 0;
      for (let j = 0; j < 4; j++) {
        if (tf[i]?.[j] === tfKey[i]?.[j]) correct++;
      }
      if (correct === 1) score += point * 0.1;
      else if (correct === 2) score += point * 0.25;
      else if (correct === 3) score += point * 0.5;
      else if (correct === 4) score += point;
    }

    const saKey = answerKey.shortAnswer ?? [];
    const sa = answers.shortAnswer ?? [];
    for (let i = 0; i < saKey.length; i++) {
      const student = this.normalizeShortAnswer(sa[i]);
      const correct = this.normalizeShortAnswer(saKey[i]);
      if (student !== "" && student === correct) score += point;
    }
    return score;
  }

  private getCustomTotalQuestions(answerKey: any) {
    return (
      (answerKey.multipleChoice?.length ?? 0) +
      (answerKey.trueFalse?.length ?? 0) +
      (answerKey.shortAnswer?.length ?? 0)
    );
  }

  private normalizeShortAnswer(value: any): string {
    if (Array.isArray(value)) {
      return value.join("").replace(/\s/g, "").trim();
    }
    return String(value ?? "").replace(/\s/g, "").trim();
  }

  async getSubmittedAttemptsForRegrade(examId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("id, exam_id, student_id, answers, score, is_passed, submitted_at")
      .eq("exam_id", examId)
      .not("submitted_at", "is", null);

    if (error) throw error;
    return data ?? [];
  }
}

export const studentExamRepository = new StudentExamRepository();