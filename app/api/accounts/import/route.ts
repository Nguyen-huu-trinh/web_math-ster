import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { accountService } from "@/services/account.service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          message: "Không có file Excel.",
        },
        {
          status: 400,
        }
      );
    }

    const courseIds = formData.getAll("courseIds") as string[];

    //---------------------------------------
    // Read excel
    //---------------------------------------

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
    });

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows = XLSX.utils.sheet_to_json(sheet);

    //---------------------------------------
    // Convert rows
    //---------------------------------------

    const students = rows.map((r: any) => ({
      student_code: String(
        r.student_code ?? ""
      ).trim(),

      full_name: String(
        r.full_name ?? ""
      ).trim(),

      personal_email: String(
        r.personal_email ?? ""
      ).trim(),
    }));

    //---------------------------------------
    // Import
    //---------------------------------------

    const result =
      await accountService.importStudents(
        students,
        courseIds
      );

    return NextResponse.json(result);
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        message:
          e.message ??
          "Import thất bại.",
      },
      {
        status: 500,
      }
    );
  }
}