"use client";

import { useEffect } from "react";
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

    const form = useForm<FormData>({
        defaultValues: {
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

            title: resource?.file_links?.title ?? "",

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
                if (!v) onClose();
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
                    onSubmit={form.handleSubmit(onSubmit)}
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

                    <DialogFooter>

                        <Button
                            variant="outline"
                            type="button"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>

                        <Button type="submit" className="rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400">

                            Lưu

                        </Button>

                    </DialogFooter>

                </form>

            </DialogContent>

        </Dialog>

    );

}