// import { NextRequest, NextResponse } from "next/server";
// import { studentAnswerService } from "@/services/student-answer.service";
// import { SaveStudentAnswerSchema } from "@/validators/student-answer.schema";

// export async function GET(
//   request: NextRequest
// ) {
//   const attemptId =
//     request.nextUrl.searchParams.get(
//       "attemptId"
//     );

//   if (!attemptId) {
//     return NextResponse.json(
//       {
//         message:
//           "attemptId is required",
//       },
//       {
//         status: 400,
//       }
//     );
//   }

//   return NextResponse.json(
//     await studentAnswerService.getByAttempt(
//       attemptId
//     )
//   );
// }

// export async function POST(
//   request: NextRequest
// ) {
//   const body =
//     await request.json();

//   const values =
//     SaveStudentAnswerSchema.parse(
//       body
//     );

//   return NextResponse.json(
//     await studentAnswerService.save(
//       values
//     )
//   );
// }