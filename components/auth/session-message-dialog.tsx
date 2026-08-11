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

const SESSION_MESSAGE_KEY =
    "mathster_session_message";

export function SessionMessageDialog() {
    const [message, setMessage] =
        useState<string | null>(null);

    useEffect(() => {
        const storedMessage =
            sessionStorage.getItem(
                SESSION_MESSAGE_KEY
            );

        if (storedMessage) {
            setMessage(storedMessage);
        }
    }, []);

    function handleOk() {
        sessionStorage.removeItem(
            SESSION_MESSAGE_KEY
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
                        onClick={handleOk}
                    >
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}