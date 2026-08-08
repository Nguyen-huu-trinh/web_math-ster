import {
    announcementRepository,
} from "@/repositories/announcement.repository";

export class AnnouncementService {

    async get() {

        return announcementRepository.getActive();

    }

    async update(
        id: string,
        title: string,
        content: string,
    ) {

        return announcementRepository.update(
            id,
            title,
            content,
        );

    }

}

export const announcementService =
    new AnnouncementService();