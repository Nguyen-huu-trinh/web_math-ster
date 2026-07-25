// import { NextRequest, NextResponse } from "next/server";
// import { chapterService } from "@/services/chapter.service";
// import { CreateChapterSchema } from "@/validators/chapter.schema";

// export async function GET(
//   request: NextRequest
// ) {
//   const courseId =
//     request.nextUrl.searchParams.get(
//       "courseId"
//     );

//   if (!courseId) {
//     return NextResponse.json(
//       {
//         message:
//           "courseId is required",
//       },
//       {
//         status: 400,
//       }
//     );
//   }

//   return NextResponse.json(
//     await chapterService.getByCourse(
//       courseId
//     )
//   );
// }

// export async function POST(
//   request: NextRequest
// ) {
//   const body =
//     await request.json();

//   const values =
//     CreateChapterSchema.parse(
//       body
//     );

//   return NextResponse.json(
//     await chapterService.create(
//       values
//     ),
//     {
//       status: 201,
//     }
//   );
// }