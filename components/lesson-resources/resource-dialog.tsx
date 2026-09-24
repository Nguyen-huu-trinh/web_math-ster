"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    RESOURCE_PROVIDERS,
    RESOURCE_TYPES,
    PROVIDER_LABELS,
} from "@/constants/resource";

interface FormData {

    sendNotification: boolean;
    title: string;

    type: "VIDEO" | "PDF" | "EXAM";

    provider: string;

    url: string;

    order_index: number;

}

interface Props {

    open: boolean;

    resource?: any;

    onClose: () => void;

    onSubmit: (values: FormData) => void | Promise<void>;

}

export function ResourceDialog({

    open,

    resource,

    onClose,

    onSubmit,

}: Props) {

    const submittingRef = useRef(false);
    const form = useForm<FormData>({
        defaultValues: {
            sendNotification: false,
            title: "",
            type: "VIDEO",
            provider: "youtube",
            url: "",
            order_index: 1,
        },
    });

    useEffect(() => {

        if (!open) return;

        form.reset({

            sendNotification: false,
            title: resource?.title ?? resource?.file_links?.title ?? "",

            type: resource?.type ?? "VIDEO",

            provider:
                resource?.file_links?.provider ??
                "youtube",

            url:
                resource?.file_links?.url ?? "",

            order_index:
                resource?.order_index ?? 1,

        });

    }, [open, resource]);

    return (

        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v && !form.formState.isSubmitting) onClose();
            }}
        >

            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-slate-200 bg-white sm:max-w-lg">

                <DialogHeader>

                    <DialogTitle>

                        {resource
                            ? "Chỉnh sửa tài liệu"
                            : "Thêm tài liệu"}

                    </DialogTitle>

                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(async (values) => {
                        if (submittingRef.current) return;
                        submittingRef.current = true;
                        try { await onSubmit(values); } finally { submittingRef.current = false; }
                    })}
                    className="space-y-4"
                >

                    <div>

                        <Label>Tên tài liệu</Label>

                        <Input
                            {...form.register("title", {
                                required: true,
                            })}
                        />

                    </div>

                    <div>

                        <Label>Loại tài liệu</Label>

                        <Select
                            value={form.watch("type")}
                            onValueChange={(v) => {
                                if (v !== "VIDEO" && v !== "PDF" && v !== "EXAM") return;
                                const providers = { VIDEO: "youtube", PDF: "google_drive", EXAM: "other" };
                                form.setValue("type", v, { shouldDirty: true });
                                form.setValue("provider", providers[v], { shouldDirty: true });
                            }}
                        >

                            <SelectTrigger>

                                <SelectValue />

                            </SelectTrigger>

                            <SelectContent>

                                {RESOURCE_TYPES.map(
                                    (type) => (

                                        <SelectItem
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </SelectItem>

                                    )
                                )}

                            </SelectContent>

                        </Select>

                    </div>

                    <div>

                        <Label>Nguồn tài liệu</Label>

                        <Select
                            value={form.watch(
                                "provider"
                            )}
                            onValueChange={(v) =>
                                form.setValue(
                                    "provider",
                                    v as FormData["provider"]
                                )
                            }
                        >

                            <SelectTrigger>

                                <SelectValue />

                            </SelectTrigger>

                            <SelectContent>

                                {RESOURCE_PROVIDERS.map(
                                    (provider) => (

                                        <SelectItem
                                            key={provider}
                                            value={provider}
                                        >
                                            {
                                                PROVIDER_LABELS[
                                                    provider
                                                ]
                                            }

                                        </SelectItem>

                                    )
                                )}

                            </SelectContent>

                        </Select>

                    </div>

                    <div>

                        <Label>URL</Label>

                        <Input
                            placeholder="https://..."
                            {...form.register("url", {
                                required: true,
                            })}
                        />

                    </div>

                    <div>

                        <Label>Thứ tự</Label>

                        <Input
                            type="number"
                            min={1}
                            {...form.register(
                                "order_index",
                                {
                                    valueAsNumber:
                                        true,
                                }
                            )}
                        />

                    </div>

                    <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-sm text-slate-700"><input type="checkbox" {...form.register("sendNotification")} disabled={form.formState.isSubmitting} className="mt-1 accent-amber-500" />Gửi thông báo bài học mới đến học sinh</label>
                    <DialogFooter>

                        <Button
                            variant="outline"
                            type="button"
                            disabled={form.formState.isSubmitting}
                            onClick={onClose}
                        >
                            Hủy
                        </Button>

                        <Button disabled={form.formState.isSubmitting} type="submit" className="rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400">

                            {form.formState.isSubmitting ? (form.watch("sendNotification") ? "Đang lưu và gửi thông báo..." : "Đang lưu...") : form.watch("sendNotification") ? "Lưu & Thông báo" : "Lưu thay đổi"}

                        </Button>

                    </DialogFooter>

                </form>

            </DialogContent>

        </Dialog>

    );

}