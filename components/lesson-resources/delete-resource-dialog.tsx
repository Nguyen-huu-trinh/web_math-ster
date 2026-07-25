"use client";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface Props {

    open: boolean;

    resource: any;

    onClose: () => void;

    onDelete: () => void | Promise<void>;

}

export function DeleteResourceDialog({

    open,

    resource,

    onClose,

    onDelete,

}: Props) {

    return (

        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>

                        Delete Resource

                    </DialogTitle>

                </DialogHeader>

                <p>

                    Delete

                    <strong>

                        {" "}
                        {resource?.file_links?.title}
                        {" "}

                    </strong>

                    ?

                </p>

                <DialogFooter>

                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={onDelete}
                    >
                        Delete
                    </Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>

    );

}