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

            <DialogContent className="sm:max-w-lg">

                <DialogHeader>

                    <DialogTitle>

                        {resource
                            ? "Edit Resource"
                            : "Add Resource"}

                    </DialogTitle>

                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >

                    <div>

                        <Label>Title</Label>

                        <Input
                            {...form.register("title", {
                                required: true,
                            })}
                        />

                    </div>

                    <div>

                        <Label>Type</Label>

                        <Select
                            value={form.watch("type")}
                            onValueChange={(v) =>
                                form.setValue(
                                    "type",
                                    v as any
                                )
                            }
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

                        <Label>Provider</Label>

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

                        <Label>Order</Label>

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
                            Cancel
                        </Button>

                        <Button type="submit">

                            Save

                        </Button>

                    </DialogFooter>

                </form>

            </DialogContent>

        </Dialog>

    );

}