import { NextRequest } from "next/server";

import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";

import { announcementService } from "@/services/announcement.service";

export async function GET() {

    try {

        return success(
            await announcementService.get()
        );

    } catch (error) {

        console.error("GET ANNOUNCEMENT ERROR:", error);

        return handleError(error);

    }

}

export async function PATCH(

    request: NextRequest

) {

    try {

        const body = await request.json();

        await announcementService.update(

            body.id,

            body.title,

            body.content,

        );

        return success({

            message: "Announcement updated"

        });

    }

    catch (error) {

        return handleError(error);

    }

}