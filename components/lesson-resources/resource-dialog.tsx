"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { BellRing, Check, Clapperboard, FileText, FolderPlus, Link2, ClipboardList } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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

            <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-0 text-slate-800 sm:max-w-[620px] [&>[data-slot=dialog-close]]:right-6 [&>[data-slot=dialog-close]]:top-7 [&>[data-slot=dialog-close]]:rounded-2xl [&>[data-slot=dialog-close]]:bg-slate-800 [&>[data-slot=dialog-close]]:text-slate-400">

                <DialogHeader className="flex-row items-center gap-4 bg-slate-900 px-6 py-7 pr-20 sm:px-8 sm:pr-20">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400"><FolderPlus className="size-6" /></div>
                    <div className="space-y-1">

                    <DialogTitle className="text-xl font-extrabold text-white">

                        {resource
                            ? "Chỉnh sửa tài liệu"
                            : "Thêm Tài Liệu Bài Học"}

                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-400">Đính kèm video bài giảng hoặc file PDF đề cương</DialogDescription>
                    </div>

                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(async (values) => {
                        if (submittingRef.current) return;
                        submittingRef.current = true;
                        try { await onSubmit(values); } finally { submittingRef.current = false; }
                    })}
                    className="grid grid-cols-1 gap-6 px-6 pt-8 sm:grid-cols-[1.4fr_1.1fr_0.8fr] sm:px-8 [&_label]:font-bold [&_label]:text-slate-700 [&_input:not([type=checkbox])]:h-12 [&_input:not([type=checkbox])]:rounded-2xl [&_input:not([type=checkbox])]:border-slate-200 [&_input:not([type=checkbox])]:bg-slate-50/60 [&_input:not([type=checkbox])]:font-semibold [&_input]:placeholder:text-slate-400 [&_[data-slot=select-trigger]]:h-12 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:rounded-2xl [&_[data-slot=select-trigger]]:border-slate-200 [&_[data-slot=select-trigger]]:bg-slate-50 [&_[data-slot=select-trigger]]:font-bold"
                >

                    <div className="space-y-2 sm:col-span-3">

                        <Label htmlFor="resource-title">Tên tài liệu <span className="text-rose-500">*</span></Label>

                        <Input
                            id="resource-title"
                            placeholder="VD: Video bài giảng phần 1 / File PDF bài tập…"
                            {...form.register("title", {
                                required: true,
                            })}
                        />

                    </div>

                    <div className="space-y-2">

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
                                            {type === "VIDEO" ? <Clapperboard className="size-4" /> : type === "PDF" ? <FileText className="size-4" /> : <ClipboardList className="size-4" />}{type}
                                        </SelectItem>

                                    )
                                )}

                            </SelectContent>

                        </Select>

                    </div>

                    <div className="space-y-2">

                        <Label>Nguồn lưu trữ</Label>

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

                    <div className="space-y-2">

                        <Label htmlFor="resource-order">Thứ tự</Label>

                        <Input
                            id="resource-order"
                            className="text-center"
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

                    <div className="space-y-2 sm:col-span-3">
                        <Label htmlFor="resource-url">Đường dẫn (URL) <span className="text-rose-500">*</span></Label>
                        <div className="relative">
                            <Link2 className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
                            <Input id="resource-url" className="pl-12" placeholder={form.watch("provider") === "youtube" ? "https://youtube.com/watch?v=…" : "https://…"} {...form.register("url", { required: true })} />
                        </div>
                    </div>
                    <label className="mb-2 flex cursor-pointer items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50/50 px-4 py-4 text-sm sm:col-span-3"><input type="checkbox" {...form.register("sendNotification")} disabled={form.formState.isSubmitting} className="size-5 shrink-0 accent-slate-900" /><BellRing className="size-5 shrink-0 text-amber-500" />Gửi thông báo bài học mới đến học sinh</label>
                    <DialogFooter className="mx-0 mb-0 -mr-6 -ml-6 gap-3 rounded-none border-slate-100 bg-slate-50 px-6 py-6 sm:col-span-3 sm:-mr-8 sm:-ml-8 sm:px-8">

                        <Button
                            variant="outline"
                            type="button"
                            disabled={form.formState.isSubmitting}
                            onClick={onClose}
                            className="h-12 rounded-2xl border-slate-200 bg-white px-6 font-bold text-slate-700"
                        >
                            Hủy
                        </Button>

                        <Button disabled={form.formState.isSubmitting} type="submit" className="h-12 rounded-2xl bg-slate-900 px-6 font-bold text-white hover:bg-slate-800">
                            <Check className="size-5 text-amber-400" />

                            {form.formState.isSubmitting ? (form.watch("sendNotification") ? "Đang lưu và gửi thông báo..." : "Đang lưu...") : form.watch("sendNotification") ? "Lưu & Thông báo" : "Lưu thay đổi"}

                        </Button>

                    </DialogFooter>

                </form>

            </DialogContent>

        </Dialog>

    );

}
