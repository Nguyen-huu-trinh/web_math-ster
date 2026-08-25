"use client";
import { useMemo, useState } from "react";
import { MoreHorizontal, Eye, Ban, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    useEnableTeacherStudent,
} from "@/hooks/use-enable-teacher-student";
import { UserCheck } from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    useUpdateTeacherStudentFinancial,
} from "@/hooks/use-update-teacher-student-financial";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import {
    Button,
} from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    TeacherStudentListItem,
} from "@/services/teacher-student-client.service";

import {
    useDisableTeacherStudent,
} from "@/hooks/use-disable-teacher-student";

import {
    useDeleteTeacherStudent,
} from "@/hooks/use-delete-teacher-student";

type SortKey =
    | "studentCode"
    | "points"
    | "rewardMoney"
    | "averageScore";

type SortDirection =
    | "asc"
    | "desc";

interface Props {
    students: TeacherStudentListItem[];
}

export function TeacherStudentsTable({
    students,
}: Props) {
    const router = useRouter();
    const [sortKey, setSortKey] =
    useState<SortKey | null>(null);

    const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");
    const disableStudent =
    useDisableTeacherStudent();
    const enableStudent =
    useEnableTeacherStudent();
    const deleteStudent =
        useDeleteTeacherStudent();
    const updateFinancial =
    useUpdateTeacherStudentFinancial();
        const [editingCell, setEditingCell] =
        useState<{
            studentId: string;
            field:
                | "points"
                | "rewardMoney";
        } | null>(null);

    const [editValue, setEditValue] =
        useState("");

    function startEditing(
        studentId: string,
        field:
            | "points"
            | "rewardMoney",
        value: number
    ) {
        setEditingCell({
            studentId,
            field,
        });

        setEditValue(
            String(value)
        );
    }

    async function saveEditing() {
        if (!editingCell) {
            return;
        }

        const value =
            Number(editValue);

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {
            return;
        }

        try {
            await updateFinancial.mutateAsync({
                studentId:
                    editingCell.studentId,

                values:
                    editingCell.field ===
                    "points"
                        ? {
                            points: value,
                        }
                        : {
                            rewardMoney:
                                value,
                        },
            });

            setEditingCell(null);
            setEditValue("");
        } catch (error) {
            console.error(
                "UPDATE FINANCIAL ERROR:",
                error
            );
        }
    }
    function cancelEditing() {
        setEditingCell(null);
        setEditValue("");
    }

    function handleSort(
        key: SortKey
    ) {
        if (sortKey === key) {
            setSortDirection(
                (current) =>
                    current === "asc"
                        ? "desc"
                        : "asc"
            );

            return;
        }

        setSortKey(key);
        setSortDirection("asc");
    }

    const sortedStudents = useMemo(() => {
        if (!sortKey) {
            return students;
        }

        return [...students].sort(
            (a, b) => {
                let comparison = 0;

                switch (sortKey) {
                    case "studentCode":
                        comparison =
                            a.studentCode.localeCompare(
                                b.studentCode,
                                "vi"
                            );
                        break;

                    case "points":
                        comparison =
                            a.points - b.points;
                        break;

                    case "rewardMoney":
                        comparison =
                            a.rewardMoney -
                            b.rewardMoney;
                        break;

                    case "averageScore":
                        comparison =
                            a.averageScore -
                            b.averageScore;
                        break;
                }

                return sortDirection ===
                    "asc"
                    ? comparison
                    : -comparison;
            }
        );
    }, [
        students,
        sortKey,
        sortDirection,
    ]);

    function getInitials(
        name: string
    ) {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(-2)
            .map((part) =>
                part[0]?.toUpperCase()
            )
            .join("");
    }


    function getAvatarUrl(url?: string | null) {
    if (!url) return undefined;

    // Google Drive:
    // https://drive.google.com/file/d/FILE_ID/view
    const match = url.match(
        /drive\.google\.com\/file\/d\/([^/]+)/
    );

    if (match?.[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
    }

    // Nếu đã là URL ảnh trực tiếp thì giữ nguyên
    return url;
}

    function handleDisable(
        student: TeacherStudentListItem
    ) {
        if (!student.isActive) {
            return;
        }

        const confirmed =
            window.confirm(
                `Bạn có chắc muốn vô hiệu hóa học sinh "${student.fullName}"?`
            );

        if (!confirmed) {
            return;
        }

        disableStudent.mutate(
            student.id
        );
    }

    function handleEnable(
        student: TeacherStudentListItem
    ) {
        if (student.isActive) {
            return;
        }

        const confirmed =
            window.confirm(
                `Bạn có chắc muốn kích hoạt lại học sinh "${student.fullName}"?`
            );

        if (!confirmed) {
            return;
        }

        enableStudent.mutate(
            student.id
        );
    }

    function handleDelete(
        student: TeacherStudentListItem
    ) {
        const confirmed =
            window.confirm(
                `Bạn có chắc muốn XÓA HẲN học sinh "${student.fullName}"? Hành động này không thể hoàn tác.`
            );

        if (!confirmed) {
            return;
        }

        deleteStudent.mutate(
            student.id,
            {
                onSuccess: () => {
                    router.refresh();
                },
            }
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/40 text-left text-sm text-muted-foreground">
                            <th className="px-5 py-3 font-medium">
                                <button
                                    type="button"
                                    className="flex items-center gap-1 hover:text-foreground"
                                    onClick={() =>
                                        handleSort(
                                            "studentCode"
                                        )
                                    }
                                >
                                    Mã HS

                                    {sortKey ===
                                        "studentCode" && (
                                        <span className="text-xs">
                                            {sortDirection ===
                                            "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    )}
                                </button>
                            </th>
                                <th className="px-5 py-3 font-medium">
                                    Họ tên
                                </th>

                                <th className="px-5 py-3 font-medium">
                                    Mục tieu
                                </th>
                                <th className="px-5 py-3 text-right font-medium">
                                    <button
                                        type="button"
                                        className="ml-auto flex items-center gap-1 hover:text-foreground"
                                        onClick={() =>
                                            handleSort("points")
                                        }
                                    >
                                        Độ trâu

                                        {sortKey === "points" && (
                                            <span className="text-xs">
                                                {sortDirection ===
                                                "asc"
                                                    ? "↑"
                                                    : "↓"}
                                            </span>
                                        )}
                                    </button>
                                </th>
                                <th className="px-5 py-3 text-right font-medium">
                                    <button
                                        type="button"
                                        className="ml-auto flex items-center gap-1 hover:text-foreground"
                                        onClick={() =>
                                            handleSort(
                                                "rewardMoney"
                                            )
                                        }
                                    >
                                        Tiền thưởng

                                        {sortKey ===
                                            "rewardMoney" && (
                                            <span className="text-xs">
                                                {sortDirection ===
                                                "asc"
                                                    ? "↑"
                                                    : "↓"}
                                            </span>
                                        )}
                                    </button>
                                </th>

                                <th className="px-5 py-3 text-right font-medium">
                                    <button
                                        type="button"
                                        className="ml-auto flex items-center gap-1 hover:text-foreground"
                                        onClick={() =>
                                            handleSort(
                                                "averageScore"
                                            )
                                        }
                                    >
                                        ĐTB

                                        {sortKey ===
                                            "averageScore" && (
                                            <span className="text-xs">
                                                {sortDirection ===
                                                "asc"
                                                    ? "↑"
                                                    : "↓"}
                                            </span>
                                        )}
                                    </button>
                                </th>
                                <th className="w-12 px-3 py-3" />
                            </tr>
                        </thead>

                        <tbody>
                            {sortedStudents.map(
                                (student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b last:border-0 cursor-pointer hover:bg-muted/30"
                                            onClick={() =>
                                                router.push(`/students/${student.id}`)
                                            }
                                        >
                                        {/* Code */}
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-sm">
                                                {
                                                    student.studentCode
                                                }
                                            </span>
                                        </td>
                                    {/* Họ tên */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
    <Avatar className="h-9 w-9 shrink-0 border">
       <AvatarImage
    src={getAvatarUrl(student.avatarUrl)}
    alt={student.fullName}
    className="object-cover"
/>

        <AvatarFallback className="text-sm font-semibold">
            {getInitials(student.fullName)}
        </AvatarFallback>
    </Avatar>

    <span className="truncate font-medium">
        {student.fullName}
    </span>
</div>
                                    </td>
                                        

                                        {/* Personal Email */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {student.learningGoal  ||
                                                    "—"}
                                            </span>
                                        </td>

                                        {/* Points */}
                                        <td className="px-5 py-4">
                                            {editingCell?.studentId ===
                                                student.id &&
                                            editingCell.field ===
                                                "points" ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editValue}
                                                        
                                                        onChange={(e) =>
                                                            setEditValue(
                                                                e.target.value
                                                            )
                                                            
                                                        }
                                                        onClick={(e) => {
                                                                 e.stopPropagation();}}
                                                        className="h-8 w-24 rounded-md border px-2 text-right text-sm"
                                                        autoFocus
                                                        disabled={
                                                            updateFinancial.isPending
                                                        }
                                                        
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === "Enter"
                                                            ) {
                                                                void saveEditing();
                                                            }

                                                            if (
                                                                e.key === "Escape"
                                                            ) {
                                                                cancelEditing();
                                                            }
                                                        }}
                                                    />

                                                   
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            startEditing(
                                                                student.id,
                                                                "points",
                                                                student.points
                                                            );
                                                        }}
                                                        className="ml-auto block cursor-pointer rounded-md px-2 py-1 text-sm font-medium hover:bg-muted"
                                                    >
                                                        {student.points.toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        {/* Reward */}
                                        <td className="px-5 py-4">
                                            {editingCell?.studentId ===
                                                student.id &&
                                            editingCell.field ===
                                                "rewardMoney" ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editValue}
                                                        onChange={(e) =>
                                                            setEditValue(
                                                                e.target.value
                                                            )
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        className="h-8 w-28 rounded-md border px-2 text-right text-sm"
                                                        autoFocus
                                                        disabled={
                                                            updateFinancial.isPending
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === "Enter"
                                                            ) {
                                                                void saveEditing();
                                                            }

                                                            if (
                                                                e.key === "Escape"
                                                            ) {
                                                                cancelEditing();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    

                                                <button
                                                    type="button"
                                                    onClick={(e) =>{
                                                         e.stopPropagation();
                                                        startEditing(
                                                            student.id,
                                                            "rewardMoney",
                                                            student.rewardMoney
                                                        );
                                                    }}
                                                    className="ml-auto block cursor-pointer rounded-md px-2 py-1 text-sm font-medium hover:bg-muted"
                                                >
                                                    {student.rewardMoney.toLocaleString(
                                                        "vi-VN"
                                                    )}
                                                </button>
                                                </div>
                                            )}
                                        </td>

 {/* Avg */}
<td className="px-5 py-4 text-right">
    <Badge
        variant="secondary"
        className={
            student.isActive
                ? ""
                : "border-zinc-300 bg-zinc-200 text-zinc-700"
        }
    >
        {student.averageScore.toFixed(2)}

        {!student.isActive && (
            <Ban className="ml-1.5 h-3 w-3" />
        )}
    </Badge>
</td>

                                        {/* Actions */}
                                        <td className="px-3 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal />
                                                        <span className="sr-only">
                                                            Mở menu
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.push(
                                                                `/students/${student.id}`
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                        View
                                                    </DropdownMenuItem>

                                                    {student.isActive ? (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation(),
                                                                handleDisable(student)
                                                            }}
                                                        >
                                                            <Ban />
                                                            Disable
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation(),
                                                                handleEnable(student)
                                                            }}
                                                        >
                                                            <UserCheck />
                                                            Enable
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation(),
                                                            handleDelete(
                                                                student
                                                            )
                                                        }}
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}