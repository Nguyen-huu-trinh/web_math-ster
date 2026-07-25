// import { NextRequest, NextResponse } from "next/server";
// import { videoService } from "@/services/video.service";
// import { CreateVideoSchema } from "@/validators/video.schema";

// export async function GET(
//   request: NextRequest
// ) {
//   const lessonId =
//     request.nextUrl.searchParams.get(
//       "lessonId"
//     );

//   if (!lessonId) {
//     return NextResponse.json(
//       {
//         message:
//           "lessonId is required",
//       },
//       {
//         status: 400,
//       }
//     );
//   }

//   return NextResponse.json(
//     await videoService.getByLesson(
//       lessonId
//     )
//   );
// }

// export async function POST(
//   request: NextRequest
// ) {
//   const body =
//     await request.json();

//   const values =
//     CreateVideoSchema.parse(body);

//   return NextResponse.json(
//     await videoService.create(values),
//     {
//       status: 201,
//     }
//   );
// }