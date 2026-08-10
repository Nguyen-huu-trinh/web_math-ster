import { createClient } from "@/lib/supabase/server";

export interface TeacherStudentListItem {
    id: string;
    fullName: string;
    studentCode: string;
    email: string;
    personalEmail: string | null;
    avatarUrl: string | null;
    points: number;
    rewardMoney: number;
    averageScore: number;
    isActive: boolean;
}

export interface TeacherStudentDetail {
    profile: {
        id: string;
        fullName: string;
        studentCode: string;
        email: string;
        personalEmail: string | null;
        avatarUrl: string | null;
        points: number;
        rewardMoney: number;
        learningGoal: string | null;
        isActive: boolean;
    };

    statistics: {
        averageScore: number;
        pendingExams: number;
        incompleteLessons: number;
    };

    exams: TeacherStudentExam[];
}

export interface TeacherStudentExamAttempt {
    id: string;
    attemptNumber: number;
    score: number | null;
    startedAt: string | null;
    submittedAt: string | null;
    createdAt: string | null;
}

export interface TeacherStudentExam {
    id: string;
    title: string;
    category: string;
    duration: number;
    attempts: TeacherStudentExamAttempt[];
}

export interface UpdateTeacherStudentInput {
    personalEmail?: string | null;
    points?: number;
    rewardMoney?: number;
}

export class TeacherStudentRepository {
    // ==========================================
    // DANH SÁCH HỌC SINH
    // ==========================================

    async getAll() {
        const supabase = await createClient();

        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                student_code,
                email,
                personal_email,
                avatar_url,
                points,
                reward_money,
                is_active
            `)
            .eq("role", "STUDENT")
            .is("deleted_at", null)
            .order("full_name", {
                ascending: true,
            });

        if (error) {
            throw error;
        }

        // Lấy dashboard để lấy average score
        const {
            data: dashboardData,
            error: dashboardError,
        } = await supabase
            .from("v_student_dashboard")
            .select(`
                student_id,
                average_periodic_score
            `);

        if (dashboardError) {
            throw dashboardError;
        }

        const dashboardMap = new Map(
            (dashboardData ?? []).map(
                (item) => [
                    item.student_id,
                    item.average_periodic_score,
                ]
            )
        );

        return (data ?? []).map((student) => ({
            id: student.id,
            fullName: student.full_name,
            studentCode: student.student_code,
            email: student.email,
            personalEmail:
                student.personal_email,
            avatarUrl: student.avatar_url,
            points: Number(
                student.points ?? 0
            ),
            rewardMoney: Number(
                student.reward_money ?? 0
            ),
            averageScore: Number(
                dashboardMap.get(
                    student.id
                ) ?? 0
            ),
            isActive: student.is_active,
        }));
    }

    // ==========================================
    // CHI TIẾT HỌC SINH
    // ==========================================

    async getById(
        studentId: string
    ) {
        const supabase = await createClient();

        // --------------------------------------
        // PROFILE
        // --------------------------------------

        const {
            data: profile,
            error: profileError,
        } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                student_code,
                email,
                personal_email,
                avatar_url,
                points,
                reward_money,
                is_active
            `)
            .eq("id", studentId)
            .eq("role", "STUDENT")
            .is("deleted_at", null)
            .single();

        if (profileError) {
            throw profileError;
        }

        // --------------------------------------
        // DASHBOARD
        // --------------------------------------

        const {
            data: dashboard,
            error: dashboardError,
        } = await supabase
            .from("v_student_dashboard")
            .select(`
                student_id,
                total_lessons,
                completed_lessons,
                pending_exams,
                average_periodic_score,
                learning_goal
            `)
            .eq("student_id", studentId)
            .single();

        if (dashboardError) {
            throw dashboardError;
        }

        // --------------------------------------
        // EXAMS
        // --------------------------------------

        const {
            data: exams,
            error: examsError,
        } = await supabase
            .from("exams")
            .select(`
                id,
                title,
                category,
                duration_minutes
            `)
            .eq("is_active", true)
            .order("created_at", {
                ascending: false,
            });

        if (examsError) {
            throw examsError;
        }

        // --------------------------------------
        // ATTEMPTS
        // --------------------------------------

        const {
            data: attempts,
            error: attemptsError,
        } = await supabase
            .from("exam_attempts")
            .select(`
                id,
                exam_id,
                attempt_number,
                score,
                started_at,
                submitted_at,
                created_at
            `)
            .eq("student_id", studentId)
            .order("created_at", {
                ascending: false,
            });

        if (attemptsError) {
            throw attemptsError;
        }

        const attemptsByExam =
            new Map<
                string,
                TeacherStudentExamAttempt[]
            >();

        for (const attempt of
            attempts ?? []) {

            const current =
                attemptsByExam.get(
                    attempt.exam_id
                ) ?? [];

            current.push({
                id: attempt.id,
                attemptNumber:
                    attempt.attempt_number,
                score:
                    attempt.score !== null
                        ? Number(
                              attempt.score
                          )
                        : null,
                startedAt:
                    attempt.started_at,
                submittedAt:
                    attempt.submitted_at,
                createdAt:
                    attempt.created_at,
            });

            attemptsByExam.set(
                attempt.exam_id,
                current
            );
        }

        const examList =
            (exams ?? []).map((exam) => ({
                id: exam.id,
                title: exam.title,
                category: exam.category,
                duration:
                    exam.duration_minutes,
                attempts:
                    attemptsByExam.get(
                        exam.id
                    ) ?? [],
            }));

        // --------------------------------------
        // RESPONSE
        // --------------------------------------

        return {
            profile: {
                id: profile.id,
                fullName:
                    profile.full_name,
                studentCode:
                    profile.student_code,
                email: profile.email,
                personalEmail:
                    profile.personal_email,
                avatarUrl:
                    profile.avatar_url,
                points: Number(
                    profile.points ?? 0
                ),
                rewardMoney: Number(
                    profile.reward_money ?? 0
                ),
                learningGoal:
                    dashboard.learning_goal ??
                    null,
                isActive:
                    profile.is_active,
            },

            statistics: {
                averageScore: Number(
                    dashboard.average_periodic_score ??
                        0
                ),

                pendingExams: Number(
                    dashboard.pending_exams ??
                        0
                ),

                incompleteLessons: Math.max(
                    Number(
                        dashboard.total_lessons ??
                            0
                    ) -
                        Number(
                            dashboard.completed_lessons ??
                                0
                        ),
                    0
                ),
            },

            exams: examList,
        };
    }

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    async update(
        studentId: string,
        values: UpdateTeacherStudentInput
    ) {
        const supabase = await createClient();

        const updateData: Record<
            string,
            unknown
        > = {};

        if (
            values.personalEmail !==
            undefined
        ) {
            updateData.personal_email =
                values.personalEmail;
        }

        if (
            values.points !== undefined
        ) {
            updateData.points =
                values.points;
        }

        if (
            values.rewardMoney !==
            undefined
        ) {
            updateData.reward_money =
                values.rewardMoney;
        }

        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", studentId)
            .eq("role", "STUDENT")
            .select(`
                id,
                full_name,
                student_code,
                email,
                personal_email,
                avatar_url,
                points,
                reward_money,
                is_active
            `)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    // ==========================================
    // DISABLE
    // ==========================================

    async disable(
        studentId: string
    ) {
        const supabase = await createClient();

        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .update({
                is_active: false,
            })
            .eq("id", studentId)
            .eq("role", "STUDENT")
            .select("id, is_active")
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    // ==========================================
    // DELETE STUDENT - HARD DELETE
    // ==========================================

    async delete(
        studentId: string
    ) {
        const supabase = await createClient();

        const {
            error,
        } = await supabase
            .from("profiles")
            .delete()
            .eq("id", studentId)
            .eq("role", "STUDENT");

        if (error) {
            throw error;
        }
    }

    // ==========================================
    // DELETE ATTEMPT - HARD DELETE
    // ==========================================

    async deleteAttempt(
        studentId: string,
        attemptId: string
    ) {
        const supabase = await createClient();

        const {
            error,
        } = await supabase
            .from("exam_attempts")
            .delete()
            .eq("id", attemptId)
            .eq("student_id", studentId);

        if (error) {
            throw error;
        }
    }
}

export const teacherStudentRepository =
    new TeacherStudentRepository();