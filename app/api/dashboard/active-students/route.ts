import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { dashboardRepository } from "@/repositories/dashboard.repository";

export async function GET() {

    try {

        const data =
            await dashboardRepository
                .getActiveStudentCount();

        return success(data);

    } catch (error) {

        return handleError(error);

    }

}