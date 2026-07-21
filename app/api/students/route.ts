import { NextRequest } from "next/server";

import { studentService } from "@/services/student.service";

import {
  CreateStudentSchema,
} from "@/validators/student.schema";

import { requireTeacher } from "@/lib/auth/teacher";

import {
  success,
  created,
} from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

export async function GET() {
  try {

    await requireTeacher();

    const students =
      await studentService.getAll();

    return success(students);

  } catch (error) {

    return handleError(error);

  }
}

export async function POST(
  request: NextRequest
) {
  try {

    await requireTeacher();

    const body =
      await request.json();

    const data =
      CreateStudentSchema.parse(body);

    const student =
      await studentService.create(data);

    return created(student);

  } catch (error) {

    return handleError(error);

  }
}