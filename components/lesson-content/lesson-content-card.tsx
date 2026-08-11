"use client";

import {
    FileText,
    Video,
    Link2,
    Presentation,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
    content: any;

    role?: string;

    onEdit?: (content: any) => void;

    onDelete?: (content: any) => void;
}

export function LessonContentCard({
    content,
    role,
    onEdit,
    onDelete,
}: Props) {

    function getIcon() {
        switch (content.type) {
            case "VIDEO":
                return (
                    <Video className="h-5 w-5" />
                );

            case "PDF":
                return (
                    <FileText className="h-5 w-5" />
                );

            case "SLIDE":
                return (
                    <Presentation className="h-5 w-5" />
                );

            case "LINK":
                return (
                    <Link2 className="h-5 w-5" />
                );

            default:
                return (
                    <FileText className="h-5 w-5" />
                );
        }
    }

    async function handleOpen() {
        /*
         * Giáo viên không bị kiểm tra quyền.
         */
        if (role === "TEACHER") {
            openResource();
            return;
        }

        /*
         * =====================================================
         * RESOURCE KHÔNG LIÊN QUAN ĐẾN EXAM
         * =====================================================
         *
         * exam_id = null
         * → mở bình thường.
         */
        if (!content.exam_id) {
            openResource();
            return;
        }

        try {
            /*
             * =================================================
             * KIỂM TRA QUYỀN XEM RESOURCE
             * =================================================
             */
            const response = await fetch(
                `/api/student/lesson-contents/${content.id}/access`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const result =
                await response.json();

            /*
             * API lỗi
             */
            if (!response.ok) {
                toast.error(
                    "Không thể kiểm tra quyền truy cập",
                    {
                        description:
                            result.message ??
                            "Vui lòng thử lại.",
                    }
                );

                return;
            }

            /*
             * =================================================
             * CHƯA ĐƯỢC PHÉP
             * =================================================
             */
            if (!result.allowed) {
                toast.warning(
                    "Chưa thể xem đáp án",
                    {
                        description:
                            result.message ??
                            "Cần làm đề kiểm tra trước khi xem đáp án.",
                    }
                );

                return;
            }

            /*
             * =================================================
             * ĐƯỢC PHÉP
             * =================================================
             */
            openResource();

        } catch (error) {
            console.error(
                "CHECK RESOURCE ACCESS ERROR:",
                error
            );

            toast.error(
                "Có lỗi xảy ra",
                {
                    description:
                        "Không thể kiểm tra quyền xem tài liệu.",
                }
            );
        }
    }

    function openResource() {
        /*
         * =====================================================
         * LẤY URL RESOURCE
         * =====================================================
         *
         * Tùy cấu trúc dữ liệu hiện tại của bạn,
         * URL nằm trong file_links.url.
         */
        const url =
            content.file_links?.url ??
            content.url;

        if (!url) {
            toast.error(
                "Không tìm thấy tài liệu",
                {
                    description:
                        "Resource này chưa có đường dẫn.",
                }
            );

            return;
        }

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }

    return (
        <div
            className="
                flex
                items-center
                justify-between
                rounded-lg
                border
                p-4
                hover:bg-muted/40
            "
        >

            {/* ================================================= */}
            {/* RESOURCE */}
            {/* ================================================= */}

            <button
                type="button"
                className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-4
                    text-left
                    rounded-lg
                    outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                "
                onClick={handleOpen}
            >

                <div
                    className="
                        shrink-0
                        rounded-lg
                        bg-primary/10
                        p-2
                        text-primary
                    "
                >
                    {getIcon()}
                </div>

                <div className="min-w-0">

                    <div className="truncate font-medium">
                        {content.title}
                    </div>

                    <div className="text-sm text-muted-foreground">
                        {content.type}
                    </div>

                </div>

            </button>

            {/* ================================================= */}
            {/* TEACHER ACTIONS */}
            {/* ================================================= */}

            {role === "TEACHER" && (

                <div className="ml-4 flex shrink-0 gap-2">

                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            onEdit?.(content)
                        }
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() =>
                            onDelete?.(content)
                        }
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                </div>

            )}

        </div>
    );
}