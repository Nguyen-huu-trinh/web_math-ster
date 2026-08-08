import { apiClient } from "@/lib/api/client";

export interface Announcement {

    id: string;

    title: string;

    content: string;

    is_active: boolean;

}

class AnnouncementClientService {

    async get(): Promise<Announcement> {

    const response = await apiClient.get<any>(
        "/api/announcement"
    );

    return response.data;

}

    async update(
    announcement: Announcement
) {

    const response = await apiClient.patch<any>(
        "/api/announcement",
        announcement
    );

    return response.data;

}

}

export const announcementClientService =
    new AnnouncementClientService();