"use client";

import { getStudentAvatarUrl as getAvatarUrl } from "@/lib/avatar";

import { useMemo, useState } from "react";
import { Check, Search, UserPlus } from "lucide-react";
import { ManagementDialogHeader, managementDialogClass, managementFormClass, managementFooterClass, managementCancelClass, managementSaveClass } from "@/components/ui/management-dialog";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
    TeacherStudentListItem,
} from "@/services/teacher-student-client.service";

import {
    useAddTeacherCourseStudent,
} from "@/hooks/use-add-teacher-course-student";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    students: TeacherStudentListItem[];
    enrolledStudentIds: Set<string>;
}

export function AddStudentToCourseDialog({
    open,
    onOpenChange,
    courseId,
    students,
    enrolledStudentIds,
}: Props) {
    const [search, setSearch] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] =
        useState<Set<string>>(new Set());

    const addStudent = useAddTeacherCourseStudent();

    const availableStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return students.filter((student) => {
            if (enrolledStudentIds.has(student.id)) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return (
                student.fullName
                    .toLowerCase()
                    .includes(keyword) ||
                student.studentCode
                    .toLowerCase()
                    .includes(keyword) ||
                student.email
                    .toLowerCase()
                    .includes(keyword)
            );
        });
    }, [
        students,
        enrolledStudentIds,
        search,
    ]);

    function getInitials(name: string) {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(-2)
            .map((part) => part[0]?.toUpperCase())
            .join("");
    }



    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setSearch("");
            setSelectedStudentIds(new Set());
        }

        onOpenChange(nextOpen);
    }

    function toggleStudent(studentId: string) {
        setSelectedStudentIds((current) => {
            const next = new Set(current);

            if (next.has(studentId)) {
                next.delete(studentId);
            } else {
                next.add(studentId);
            }

            return next;
        });
    }

    function selectAllVisible() {
        setSelectedStudentIds((current) => {
            const next = new Set(current);

            availableStudents.forEach((student) => {
                next.add(student.id);
            });

            return next;
        });
    }

    function clearSelection() {
        setSelectedStudentIds(new Set());
    }

    async function handleAdd() {
        if (selectedStudentIds.size === 0) {
            return;
        }

        try {
            await addStudent.mutateAsync({
                courseId,
                studentIds: Array.from(selectedStudentIds),
            });

            handleOpenChange(false);
        } catch (error) {
            console.error(
                "ADD STUDENTS TO COURSE ERROR:",
                error
            );
        }
    }

    const selectedCount = selectedStudentIds.size;

    const allVisibleSelected =
        availableStudents.length > 0 &&
        availableStudents.every((student) =>
            selectedStudentIds.has(student.id)
        );

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogContent className={managementDialogClass}>
                <ManagementDialogHeader icon={UserPlus} title="Thêm Học Sinh" description="Chọn một hoặc nhiều học sinh để thêm vào khóa học này." />

                <div className={managementFormClass}>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Tìm theo tên, mã học sinh hoặc email..."
                            aria-label="Tìm học sinh"
                            className="pl-12 focus-visible:border-amber-400 focus-visible:ring-amber-400/25"
                        />
                    </div>

                    {availableStudents.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">
                                Đã chọn:{" "}
                                <span className="font-bold text-slate-900">
                                    {selectedCount}
                                </span>{" "}
                                học sinh
                            </span>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="font-bold text-slate-900 hover:bg-amber-50"
                                onClick={
                                    allVisibleSelected
                                        ? clearSelection
                                        : selectAllVisible
                                }
                            >
                                {allVisibleSelected
                                    ? "Bỏ chọn tất cả"
                                    : "Chọn tất cả"}
                            </Button>
                        </div>
                    )}

                    <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200">
                        {availableStudents.length === 0 ? (
                            <div className="bg-slate-50/60 px-6 py-8 text-center text-sm font-medium text-slate-500">
                                {search
                                    ? "Không tìm thấy học sinh phù hợp."
                                    : "Tất cả học sinh đã thuộc khóa học này."}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {availableStudents.map((student) => {
                                    const selected =
                                        selectedStudentIds.has(
                                            student.id
                                        );

                                    return (
                                        <button
                                            key={student.id}
                                            type="button"
                                            className={[
                                                "flex w-full items-center gap-3 p-3 text-left transition-colors",
                                                "hover:bg-amber-50/60",
                                                selected
                                                    ? "bg-amber-50"
                                                    : "",
                                            ].join(" ")}
                                            onClick={() =>
                                                toggleStudent(student.id)
                                            }
                                            aria-pressed={selected}
                                        >
                                            <div
                                                className={[
                                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                                                    selected
                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                        : "border-slate-300 bg-white",
                                                ].join(" ")}
                                            >
                                                {selected && (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                            </div>

                                            <Avatar className="h-9 w-9 shrink-0 border">
                                                <AvatarImage referrerPolicy="no-referrer"
                                                    src={getAvatarUrl(
                                                        student.avatarUrl
                                                    )}
                                                    alt={
                                                        student.fullName
                                                    }
                                                    className="object-cover"
                                                />

                                                <AvatarFallback>
                                                    {getInitials(
                                                        student.fullName
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0 flex-1">
                                                <div className="truncate font-bold text-slate-800">
                                                    {
                                                        student.fullName
                                                    }
                                                </div>

                                                <div className="truncate text-sm text-muted-foreground">
                                                    {
                                                        student.studentCode
                                                    }
                                                    {" · "}
                                                    {
                                                        student.email
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                <DialogFooter className={managementFooterClass}>
                    <Button
                        type="button"
                        variant="outline"
                        className={managementCancelClass}
                        onClick={() =>
                            handleOpenChange(false)
                        }
                        disabled={addStudent.isPending}
                    >
                        Hủy
                    </Button>

                    <Button
                        type="button"
                        onClick={() => void handleAdd()}
                        className={managementSaveClass}
                        disabled={
                            selectedCount === 0 ||
                            addStudent.isPending
                        }
                    >
                        <UserPlus className="size-5 text-amber-400" />

                        {addStudent.isPending
                            ? "Đang thêm..."
                            : `Thêm ${selectedCount > 0 ? selectedCount : ""} học sinh`}
                    </Button>
                </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
