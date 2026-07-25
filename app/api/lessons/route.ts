// import { NextRequest, NextResponse } from "next/server";
// import { lessonService } from "@/services/lesson.service";
// import { CreateLessonSchema } from "@/validators/lesson.schema";

// export async function GET(
//   request: NextRequest
// ) {
//   const chapterId =
//     request.nextUrl.searchParams.get("chapterId");

//   if (!chapterId) {
//     return NextResponse.json(
//       {
//         message: "chapterId is required",
//       },
//       {
//         status: 400,
//       }
//     );
//   }

//   return NextResponse.json(
//     await lessonService.getByChapter(chapterId)
//   );
// }

// export async function POST(
//   request: NextRequest
// ) {
//   const body = await request.json();

//   const values =
//     CreateLessonSchema.parse(body);

//   return NextResponse.json(
//     await lessonService.create(values),
//     {
//       status: 201,
//     }
//   );
// }