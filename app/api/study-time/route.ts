// import { NextRequest, NextResponse } from "next/server";

// import { studyTimeService } from "@/services/study-time.service";

// import { AddStudyTimeSchema } from "@/validators/study-time.schema";

// export async function GET(request: NextRequest) {
//   const studentId =
//     request.nextUrl.searchParams.get("studentId");

//   if (!studentId) {
//     return NextResponse.json(
//       {
//         message: "studentId is required",
//       },
//       {
//         status: 400,
//       }
//     );
//   }

//   return NextResponse.json({
//     today: await studyTimeService.getToday(
//       studentId
//     ),
//     total: await studyTimeService.getTotal(
//       studentId
//     ),
//     history: await studyTimeService.getDaily(
//       studentId
//     ),
//   });
// }

// export async function POST(request: NextRequest) {
//   const body = await request.json();

//   const values =
//     AddStudyTimeSchema.parse(body);

//   return NextResponse.json(
//     await studyTimeService.addTime(values)
//   );
// }