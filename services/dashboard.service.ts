import { dashboardRepository } from "@/repositories/dashboard.repository";

export class DashboardService {

    studentDashboard(studentId: string){
console.log("SERVICE studentId:", studentId);

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