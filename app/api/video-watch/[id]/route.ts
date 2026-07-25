// import { NextResponse } from "next/server";

// import { videoWatchService } from "@/services/video-watch.service";

// interface Props {
//   params: Promise<{
//     id: string;
//   }>;
// }

// export async function PATCH(
//   request: Request,
//   { params }: Props
// ) {
//   const { id } = await params;

//   return NextResponse.json(
//     await videoWatchService.complete(id)
//   );
// }