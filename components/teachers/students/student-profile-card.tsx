"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Mail,
    Pencil,
    Target,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
    Label,
} from "@/components/ui/label";

import {
    useUpdateTeacherStudent,
} from "@/hooks/use-update-teacher-student";

import type {
    TeacherStudentDetail,
} from "@/services/teacher-student-client.service";

interface Props {
    profile: TeacherStudentDetail["profile"];
}

export function StudentProfileCard({
    profile,
}: Props) {
    const [editing, setEditing] =
        useState(false);

    const [personalEmail, setPersonalEmail] =
        useState(
            profile.personalEmail ?? ""
        );

    const [points, setPoints] =
        useState(
            String(profile.points)
        );

    const [rewardMoney, setRewardMoney] =
        useState(
            String(profile.rewardMoney)
        );

    const updateStudent =
        useUpdateTeacherStudent(
            profile.id
        );

    useEffect(() => {
        setPersonalEmail(
            profile.personalEmail ?? ""
        );

        setPoints(
            String(profile.points)
        );

        setRewardMoney(
            String(profile.rewardMoney)
        );
    }, [
        profile.personalEmail,
        profile.points,
        profile.rewardMoney,
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

    function handleCancel() {
        setPersonalEmail(
            profile.personalEmail ?? ""
        );

        setPoints(
            String(profile.points)
        );

        setRewardMoney(
            String(profile.rewardMoney)
        );

        setEditing(false);
    }

    function handleSave() {
        const parsedPoints =
            Number(points);

        const parsedRewardMoney =
            Number(rewardMoney);

        if (
            !Number.isFinite(
                parsedPoints
            ) ||
            !Number.isFinite(
                parsedRewardMoney
            )
        ) {
            return;
        }

        updateStudent.mutate(
            {
                personalEmail:
                    personalEmail.trim() ||
                    null,

                points: parsedPoints,

                rewardMoney:
                    parsedRewardMoney,
            },
            {
                onSuccess: () => {
                    setEditing(false);
                },
            }
        );
    }

    return (
        <div className="rounded-xl border bg-card">
            {/* HEADER */}
            <div className="flex flex-col gap-5 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage
                            src={
                                profile.avatarUrl ??
                                undefined
                            }
                            alt={
                                profile.fullName
                            }
                        />

                        <AvatarFallback className="text-xl">
                            {getInitials(
                                profile.fullName
                            )}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h2 className="text-xl font-semibold">
                            {profile.fullName}
                        </h2>

                        <p className="mt-1 font-mono text-sm text-muted-foreground">
                            {
                                profile.studentCode
                            }
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />

                            {profile.email}
                        </div>
                    </div>
                </div>

                {!editing && (
                    <Button
                        variant="outline"
                        onClick={() =>
                            setEditing(true)
                        }
                    >
                        <Pencil />
                        Chỉnh sửa
                    </Button>
                )}
            </div>

            {/* INFORMATION */}
            <div className="grid gap-6 p-6 md:grid-cols-2">
                {/* EMAIL */}
                <div className="space-y-2">
                    <Label>
                        Email tài khoản
                    </Label>

                    <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        {profile.email}
                    </div>
                </div>

                {/* STUDENT CODE */}
                <div className="space-y-2">
                    <Label>
                        Student Code
                    </Label>

                    <div className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm">
                        {
                            profile.studentCode
                        }
                    </div>
                </div>

                {/* PERSONAL EMAIL */}
                <div className="space-y-2">
                    <Label>
                        Personal Email
                    </Label>

                    {editing ? (
                        <Input
                            value={
                                personalEmail
                            }
                            onChange={(e) =>
                                setPersonalEmail(
                                    e.target
                                        .value
                                )
                            }
                            placeholder="Email cá nhân"
                        />
                    ) : (
                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                            {profile.personalEmail ||
                                "Chưa cập nhật"}
                        </div>
                    )}
                </div>

                {/* LEARNING GOAL */}
                <div className="space-y-2">
                    <Label>
                        Learning Goal
                    </Label>

                    <div className="flex min-h-10 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <Target className="h-4 w-4 text-primary" />

                        {profile.learningGoal ||
                            "Chưa đặt mục tiêu"}
                    </div>
                </div>

                {/* POINTS */}
                <div className="space-y-2">
                    <Label>
                        Points
                    </Label>

                    {editing ? (
                        <Input
                            type="number"
                            value={points}
                            onChange={(e) =>
                                setPoints(
                                    e.target
                                        .value
                                )
                            }
                        />
                    ) : (
                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-semibold">
                            {profile.points.toLocaleString(
                                "vi-VN"
                            )}
                        </div>
                    )}
                </div>

                {/* REWARD */}
                <div className="space-y-2">
                    <Label>
                        Reward Money
                    </Label>

                    {editing ? (
                        <Input
                            type="number"
                            value={
                                rewardMoney
                            }
                            onChange={(e) =>
                                setRewardMoney(
                                    e.target
                                        .value
                                )
                            }
                        />
                    ) : (
                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-semibold">
                            {profile.rewardMoney.toLocaleString(
                                "vi-VN"
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* EDIT ACTIONS */}
            {editing && (
                <div className="flex justify-end gap-2 border-t p-4">
                    <Button
                        variant="outline"
                        onClick={
                            handleCancel
                        }
                        disabled={
                            updateStudent.isPending
                        }
                    >
                        Hủy
                    </Button>

                    <Button
                        onClick={
                            handleSave
                        }
                        disabled={
                            updateStudent.isPending
                        }
                    >
                        {updateStudent.isPending
                            ? "Đang lưu..."
                            : "Lưu thay đổi"}
                    </Button>
                </div>
            )}
        </div>
    );
}