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
    const [editingField, setEditingField] =
    useState<
        "personalEmail" |
        "points" |
        "rewardMoney" |
        null
    >(null);
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
function getAvatarUrl(url?: string | null) {
    if (!url) return undefined;

    const match = url.match(
        /drive\.google\.com\/file\/d\/([^/]+)/
    );

    if (match?.[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
    }

    return url;
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

        setEditingField(null);
    }

  function handleSave() {
    if (!editingField) {
        return;
    }

    if (editingField === "personalEmail") {
        updateStudent.mutate(
            {
                personalEmail:
                    personalEmail.trim() || null,
            },
            {
                onSuccess: () => {
                    setEditingField(null);
                },
            }
        );

        return;
    }

    if (editingField === "points") {
        const parsedPoints =
            Number(points);

        if (
            !Number.isFinite(parsedPoints) ||
            parsedPoints < 0
        ) {
            return;
        }

        updateStudent.mutate(
            {
                points: parsedPoints,
            },
            {
                onSuccess: () => {
                    setEditingField(null);
                },
            }
        );

        return;
    }

    if (editingField === "rewardMoney") {
        const parsedRewardMoney =
            Number(rewardMoney);

        if (
            !Number.isFinite(parsedRewardMoney) ||
            parsedRewardMoney < 0
        ) {
            return;
        }

        updateStudent.mutate(
            {
                rewardMoney:
                    parsedRewardMoney,
            },
            {
                onSuccess: () => {
                    setEditingField(null);
                },
            }
        );
    }
}

        

    return (
        <div className="rounded-xl border bg-card">
            {/* HEADER */}
            <div className="flex flex-col gap-5 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage
                            src={getAvatarUrl(profile.avatarUrl)}
                            alt={profile.fullName}
                            className="object-cover"
                        />

                        <AvatarFallback className="text-xl">
                            {getInitials(
                                profile.fullName
                            )}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h2 className="text-3xl font-semibold">
                            {profile.fullName}
                        </h2>

                  
                    </div>
                </div>

                
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

                    {editingField === "personalEmail" ? (
                        <div className="flex gap-2">
                            <Input
                                value={personalEmail}
                                onChange={(e) =>
                                    setPersonalEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Email cá nhân"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSave();
                                    }

                                    if (e.key === "Escape") {
                                        handleCancel();
                                    }
                                }}
                            />

                            
                        </div>
                    ) : (
                        <div
                            className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50"
                            onClick={() =>
                                setEditingField(
                                    "personalEmail"
                                )
                            }
                        >
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

                    {editingField === "points" ? (
                        <Input
                            type="number"
                            min="0"
                            value={points}
                            onChange={(e) =>
                                setPoints(e.target.value)
                            }
                            autoFocus
                            className="
                                [appearance:textfield]
                                [&::-webkit-inner-spin-button]:appearance-none
                                [&::-webkit-outer-spin-button]:appearance-none
                            "
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSave();
                                }

                                if (e.key === "Escape") {
                                    handleCancel();
                                }
                            }}
                        />
                    ) : (
                        <div
                            className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-sm font-semibold hover:bg-muted/50"
                            onClick={() =>
                                setEditingField("points")
                            }
                        >
                            {profile.points.toLocaleString("vi-VN")}
                        </div>
                    )}
                </div>

                {/* REWARD */}
                <div className="space-y-2">
                    <Label>
                        Reward Money
                    </Label>

                    {editingField === "rewardMoney" ? (
                        <Input
                            type="number"
                            min="0"
                            value={rewardMoney}
                            onChange={(e) =>
                                setRewardMoney(e.target.value)
                            }
                            autoFocus
                            className="
                                [appearance:textfield]
                                [&::-webkit-inner-spin-button]:appearance-none
                                [&::-webkit-outer-spin-button]:appearance-none
                            "
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSave();
                                }

                                if (e.key === "Escape") {
                                    handleCancel();
                                }
                            }}
                        />
                    ) : (
                        <div
                            className="cursor-pointer rounded-md border bg-muted/30 px-3 py-2 text-sm font-semibold hover:bg-muted/50"
                            onClick={() =>
                                setEditingField("rewardMoney")
                            }
                        >
                            {profile.rewardMoney.toLocaleString("vi-VN")}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}