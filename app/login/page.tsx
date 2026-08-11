"use client";
import { toast } from "sonner";
import { SessionMessageDialog } from "@/components/auth/session-message-dialog";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
    Mail,
    Lock,
    ArrowRight,
    Sparkles,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
    const {
        login,
        user,
        profile,
        loading,
    } = useAuth();

    const router = useRouter();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [remember, setRemember] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user || !profile) return;

        router.replace("/dashboard");
    }, [
        loading,
        user,
        profile,
        router,
    ]);

async function handleSubmit(
    e: React.FormEvent
) {
    e.preventDefault();

    try {
        setSubmitting(true);

        await login(
            email,
            password
        );

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            message.includes(
                "Tài khoản đã bị vô hiệu hóa"
            ) ||
            message.includes(
                "ACCOUNT_DISABLED"
            )
        ) {
            toast.error(
                "Tài khoản đã bị khóa",
                {
                    description:
                        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ giáo viên để được hỗ trợ.",
                }
            );

            return;
        }

        toast.error(
            "Đăng nhập thất bại",
            {
                description:
                    "Email hoặc mật khẩu không chính xác.",
            }
        );

    } finally {
        setSubmitting(false);
    }
}

    return (
        <>
            <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
                {/* Left — form */}
                <div className="w-full max-w-md">
                    <div className="mx-auto w-full max-w-sm animate-fade-in-up">
                        <BrandLogo className="mx-auto mb-6" />

                        <div className="mb-8">
                            <h1 className="text-center text-3xl font-bold">
                                Welcome back
                            </h1>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email address
                                    </FieldLabel>

                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Mail />
                                        </InputGroupAddon>

                                        <InputGroupInput
                                            id="email"
                                            type="email"
                                            placeholder="you@mathster.edu.vn"
                                            value={email}
                                            onChange={(
                                                e
                                            ) =>
                                                setEmail(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                        />
                                    </InputGroup>
                                </Field>

                                <Field>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>

                                        <button
                                            type="button"
                                            className="text-xs font-medium text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Lock />
                                        </InputGroupAddon>

                                        <InputGroupInput
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={
                                                password
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setPassword(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                        />
                                    </InputGroup>
                                </Field>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        checked={
                                            remember
                                        }
                                        onCheckedChange={(
                                            value
                                        ) =>
                                            setRemember(
                                                Boolean(
                                                    value
                                                )
                                            )
                                        }
                                    />

                                    <label
                                        htmlFor="remember"
                                        className="text-sm text-muted-foreground"
                                    >
                                        Nhớ tài khoản trong
                                        30 ngày
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner data-icon="inline-start" />
                                            Đang đăng nhập...
                                        </>
                                    ) : (
                                        <>
                                            Đăng nhập
                                            <ArrowRight data-icon="inline-end" />
                                        </>
                                    )}
                                </Button>
                            </FieldGroup>
                        </form>

                        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                            <Sparkles className="size-3.5 text-primary" />

                            Đăng nhập bằng tài khoản của bạn
                            để tiếp tục.
                        </p>
                    </div>
                </div>

                {/* Right — artwork */}
                <div className="relative hidden overflow-hidden bg-sidebar lg:block">
                    <Image
                        src="/login-art.png"
                        alt=""
                        fill
                        priority
                        className="object-cover opacity-90"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/40 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-12">
                        <blockquote className="max-w-md animate-fade-in-up">
                            <p className="text-balance text-2xl font-semibold leading-relaxed text-sidebar-foreground">
                                &ldquo;Math-ster turned exam
                                prep into a daily habit. My
                                average jumped from 6.8 to 8.4
                                in one semester.&rdquo;
                            </p>

                            <footer className="mt-4 text-sm text-sidebar-foreground/60">
                                Nguyen Van A · Grade 12 · Class
                                of 2027
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </main>

            {/* 
             * Thông báo heartbeat/session.
             *
             * Component này đọc message từ sessionStorage.
             * Nó tồn tại độc lập với form Login.
             */}
            <SessionMessageDialog />
        </>
    );
}