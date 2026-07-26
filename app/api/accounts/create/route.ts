import { NextResponse } from "next/server";

import { accountService } from "@/services/account.service";

export async function POST(
  request: Request
) {
  try {

    const body =
      await request.json();

    const {

      student_code,

      full_name,

      personal_email,

      course_ids,

    } = body;

    if (
      !student_code ||
      !full_name
    ) {

      return NextResponse.json(

        {
          message:
            "Thiếu thông tin học sinh.",
        },

        {
          status: 400,
        }

      );

    }

    const result =
      await accountService.createStudent({

        student_code,

        full_name,

        personal_email,

        course_ids,

      });

    return NextResponse.json(result);

  } catch (e: any) {

    return NextResponse.json(

      {
        message:
          e.message ??
          "Không thể tạo học sinh.",
      },

      {
        status: 500,
      }

    );

  }
}