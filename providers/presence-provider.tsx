"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PresenceContext = createContext<number>(1);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const [onlineCount, setOnlineCount] = useState<number>(1);

    useEffect(() => {
        const supabase = createClient();
        // Tạo tabId ngẫu nhiên để mỗi tab/thiết bị là 1 kết nối riêng
        const tabId = Math.random().toString(36).substring(2, 9);

        const channel = supabase.channel("mathster-online-users", {
            config: {
                presence: {
                    key: tabId,
                },
            },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length;
                setOnlineCount(count > 0 ? count : 1);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            void channel.unsubscribe();
            void supabase.removeChannel(channel);
        };
    }, []);

    return (
        <PresenceContext.Provider value={onlineCount}>
            {children}
        </PresenceContext.Provider>
    );
}

export const useOnlineCount = () => useContext(PresenceContext);