"use client";

import { MoreHorizontal, Eye, Ban, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

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

interface Props {
    students: TeacherStudentListItem[];
}

export function TeacherStudentsTable({
    students,
}: Props) {
    const router = useRouter();

    const disableStudent =
    useDisableTeacherStudent();

    const deleteStudent =
        useDeleteTeacherStudent();

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
                                    Học sinh
                                </th>

                                <th className="px-5 py-3 font-medium">
                                    Student Code
                                </th>

                                <th className="px-5 py-3 font-medium">
                                    Personal Email
                                </th>

                                <th className="px-5 py-3 text-right font-medium">
                                    Points
                                </th>

                                <th className="px-5 py-3 text-right font-medium">
                                    Reward
                                </th>

                                <th className="px-5 py-3 text-right font-medium">
                                    Avg. Score
                                </th>

                                <th className="w-12 px-3 py-3" />
                            </tr>
                        </thead>

                        <tbody>
                            {students.map(
                                (student) => (
                                    <tr
                                        key={
                                            student.id
                                        }
                                        className="border-b last:border-0 hover:bg-muted/30"
                                    >
                                        {/* Student */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage
                                                        src={
                                                            student.avatarUrl ??
                                                            undefined
                                                        }
                                                        alt={
                                                            student.fullName
                                                        }
                                                    />

                                                    <AvatarFallback>
                                                        {getInitials(
                                                            student.fullName
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        {
                                                            student.fullName
                                                        }
                                                    </p>

                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {
                                                            student.email
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Code */}
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-sm">
                                                {
                                                    student.studentCode
                                                }
                                            </span>
                                        </td>

                                        {/* Personal Email */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {student.personalEmail ||
                                                    "—"}
                                            </span>
                                        </td>

                                        {/* Points */}
                                        <td className="px-5 py-4 text-right font-medium">
                                            {student.points.toLocaleString(
                                                "vi-VN"
                                            )}
                                        </td>

                                        {/* Reward */}
                                        <td className="px-5 py-4 text-right font-medium">
                                            {student.rewardMoney.toLocaleString(
                                                "vi-VN"
                                            )}
                                        </td>

                                        {/* Avg */}
                                        <td className="px-5 py-4 text-right">
                                            <Badge variant="secondary">
                                                {student.averageScore.toFixed(
                                                    2
                                                )}
                                            </Badge>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
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
                                                        Xem
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        disabled={
                                                            !student.isActive
                                                        }
                                                        onClick={() =>
                                                            handleDisable(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        <Ban />
                                                        Vô hiệu hóa
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Xóa học sinh
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