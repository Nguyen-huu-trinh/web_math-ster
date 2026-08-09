import { createClient } from "@/lib/supabase/server";

import {
    success,
    fail,
} from "@/lib/api/api-response";

export async function PATCH(
    request: Request
) {
    try {
        const supabase =
            await createClient();

        // Lấy user hiện tại từ Supabase Auth
        const {
            data: {
                user,
            },
        } =
            await supabase.auth.getUser();

        if (!user) {
            return fail(
                "Unauthorized",
                401
            );
        }

        // Lấy dữ liệu từ frontend
        const body =
            await request.json();

        const learningGoal =
            typeof body.learningGoal ===
            "string"
                ? body.learningGoal.trim()
                : "";

        // Giới hạn độ dài
        if (learningGoal.length > 200) {
            return fail(
                "Mục tiêu không được vượt quá 200 ký tự",
                400
            );
        }

        // Chỉ cập nhật profile của user đang đăng nhập
        const {
            data,
            error,
        } =
            await supabase
                .from("profiles")
                .update({
                    learning_goal:
                        learningGoal ||
                        null,
                })
                .eq("id", user.id)
                .select(
                    "learning_goal"
                )
                .single();

        if (error) {
            throw error;
        }

        return success({
            learningGoal:
                data.learning_goal,
        });

    } catch (error) {

        console.error(
            "UPDATE LEARNING GOAL ERROR:",
            error
        );

        return fail(
            "Không thể cập nhật mục tiêu",
            500
        );
    }
}