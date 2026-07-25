// import { NextRequest } from "next/server";

// import { teacherService } from "@/services/teacher.service";

// import {
//   UpdateTeacherSchema,
// } from "@/validators/teacher.schema";

// import { requireAdmin } from "@/lib/auth/admin";

// import {
//   success,
// } from "@/lib/api/api-response";

// import { handleError } from "@/lib/api/handle-error";

// interface Props {
//   params: Promise<{
//     id: string;
//   }>;
// }

// export async function GET(
//   request: NextRequest,
//   { params }: Props
// ) {
//   try {
//     await requireAdmin();

//     const { id } = await params;

//     return success(
//       await teacherService.getById(id)
//     );
//   } catch (error) {
//     return handleError(error);
//   }
// }

// export async function PATCH(
//   request: NextRequest,
//   { params }: Props
// ) {
//   try {
//     await requireAdmin();

//     const body = await request.json();

//     const values =
//       UpdateTeacherSchema.parse(body);

//     const { id } = await params;

//     return success(
//       await teacherService.update(
//         id,
//         values
//       )
//     );
//   } catch (error) {
//     return handleError(error);
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: Props
// ) {
//   try {
//     await requireAdmin();

//     const { id } = await params;

//     return success(
//       await teacherService.remove(id)
//     );
//   } catch (error) {
//     return handleError(error);
//   }
// }