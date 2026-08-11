"use client";

import {
    FileText,
    Video,
    Pencil,
    Trash2,
    ExternalLink,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
    resource: any;

    editable?: boolean;

    onEdit?: (resource: any) => void;

    onDelete?: (resource: any) => void;
}

export function ResourceCard({
    resource,
    editable = false,
    onEdit,
    onDelete,
}: Props) {
    const file = resource.file_links;

    const isVideo =
        resource.type === "video";

    async function handleOpenResource() {
        /*
         * =====================================================
         * TEACHER
         * =====================================================
         *
         * Giáo viên được mở trực tiếp.
         */
        if (editable) {
            openResource();
            return;
        }

        /*
         * =====================================================
         * RESOURCE KHÔNG CẦN LÀM EXAM
         * =====================================================
         *
         * exam_id = null
         * → mở bình thường.
         */
        if (!resource.exam_id) {
            openResource();
            return;
        }

        /*
         * =====================================================
         * RESOURCE CÓ LIÊN KẾT EXAM
         * =====================================================
         *
         * Phải kiểm tra học sinh đã nộp
         * bài kiểm tra tương ứng hay chưa.
         */
        try {
            const response = await fetch(
                `/api/student/lesson-contents/${resource.id}/access`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const result =
                await response.json();

            console.log(
                "[RESOURCE ACCESS]",
                {
                    resourceId: resource.id,
                    examId: resource.exam_id,
                    status: response.status,
                    result,
                }
            );

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
                "[RESOURCE ACCESS ERROR]",
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
        if (!file?.url) {
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
            file.url,
            "_blank",
            "noopener,noreferrer"
        );
    }

    return (
        <div className="flex items-center justify-between rounded-lg border p-4">

            <div className="flex items-center gap-3">

                <div className="rounded-md bg-primary/10 p-2">
                    {isVideo ? (
                        <Video className="h-5 w-5 text-primary" />
                    ) : (
                        <FileText className="h-5 w-5 text-primary" />
                    )}
                </div>

                <div>

                    <div className="font-medium">
                        {file.title}
                    </div>

                    <div className="flex items-center gap-2 mt-1">

                        <Badge variant="secondary">
                            {file.provider}
                        </Badge>

                        <button
                            type="button"
                            onClick={handleOpenResource}
                            className="
                                text-xs
                                text-primary
                                flex
                                items-center
                                gap-1
                                hover:underline
                            "
                        >
                            Open

                            <ExternalLink className="h-3 w-3" />
                        </button>

                    </div>
                </div>
            </div>

            {editable && (
                <div className="flex gap-1">

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            onEdit?.(resource)
                        }
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() =>
                            onDelete?.(resource)
                        }
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                </div>
            )}

        </div>
    );
}