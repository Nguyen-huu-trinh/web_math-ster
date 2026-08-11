"use client";

import { useEffect, useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY =
    "auth_session_message";

export function SessionMessageDialog() {
    const [message, setMessage] =
        useState<string | null>(null);

    useEffect(() => {
        const storedMessage =
            sessionStorage.getItem(
                STORAGE_KEY
            );

        if (storedMessage) {
            setMessage(storedMessage);
        }
    }, []);

    function handleClose() {
        sessionStorage.removeItem(
            STORAGE_KEY
        );

        setMessage(null);
    }

    return (
        <AlertDialog
            open={Boolean(message)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Phiên đăng nhập đã kết thúc
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={
                            handleClose
                        }
                    >
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}