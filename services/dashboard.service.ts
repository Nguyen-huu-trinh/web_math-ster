import { dashboardRepository } from "@/repositories/dashboard.repository";

export class DashboardService {

    studentDashboard(studentId: string){

        return dashboardRepository.getStudentDashboard(
            studentId
        );

    }

    teacherDashboard(){

        return dashboardRepository.getTeacherDashboard();

    }

}

export const dashboardService =
    new DashboardService();