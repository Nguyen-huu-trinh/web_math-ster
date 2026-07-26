import { adminClient } from "@/lib/supabase/admin";
import {
  accountRepository,
} from "@/repositories/account.repository";

interface CreateStudentInput {
  student_code: string;
  full_name: string;
  personal_email: string;
  course_ids: string[];
}

interface ImportStudentInput {
  student_code: string;
  full_name: string;
  personal_email: string;
}

export class AccountService {

  // ============================================
  // CREATE ONE STUDENT
  // ============================================

  async createStudent(
    input: CreateStudentInput
  ) {

    const email =
      `${input.student_code}@mathster.edu.vn`;

    const password =
      "123456789";

    // -----------------------------
    // Create auth.users
    // -----------------------------

    const {
      data,
      error,
    } =
      await adminClient.auth.admin.createUser({

        email,

        password,

        email_confirm: true,

      });

    if (error)
      throw error;

    if (!data.user)
      throw new Error(
        "Không tạo được tài khoản."
      );

    // -----------------------------
    // Create profile
    // -----------------------------

    await accountRepository.updateProfile(
  data.user.id,
  {
    student_code: input.student_code,
    full_name: input.full_name,
    personal_email: input.personal_email,
  }
);

    // -----------------------------
    // Enroll
    // -----------------------------

    await accountRepository.enrollCourses(

      data.user.id,

      input.course_ids

    );

    return {

      email,

      password,

    };

  }

  // ============================================
  // IMPORT EXCEL
  // ============================================

  async importStudents(

    students: ImportStudentInput[],

    courseIds: string[]

  ) {

    const success: string[] = [];

    const failed: {
      student_code: string;
      reason: string;
    }[] = [];

    for (const student of students) {

      try {

        const email =
          `${student.student_code}@mathster.edu.vn`;

        const password =
          "123456789";

        //--------------------------------
        // auth.users
        //--------------------------------

        const {

          data,

          error,

        } =
          await adminClient.auth.admin.createUser({

            email,

            password,

            email_confirm: true,

          });

        if (error)
          throw error;

        //--------------------------------
        // profile
        //--------------------------------

        await accountRepository.updateProfile(
        data.user.id,
        {
            student_code: student.student_code,
            full_name: student.full_name,
            personal_email: student.personal_email,
        }
        );

        //--------------------------------
        // courses
        //--------------------------------

        await accountRepository.enrollCourses(

          data.user.id,

          courseIds

        );

        success.push(
          student.student_code
        );

      } catch (e: any) {

        failed.push({

          student_code:
            student.student_code,

          reason:
            e.message ??
            "Unknown error",

        });

      }

    }

    return {

      success,

      failed,

    };

  }

}

export const accountService =
  new AccountService();