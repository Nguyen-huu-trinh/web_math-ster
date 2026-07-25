// import { NextResponse } from "next/server";
// import { userService } from "@/services/user.service";

// interface Props {
//   params: Promise<{
//     id: string;
//   }>;
// }

// export async function POST(
//   request: Request,
//   { params }: Props
// ) {
//   const body = await request.json();

//   const { id } = await params;

//   const user =
//     await userService.resetPassword(
//       id,
//       body.password
//     );

//   return NextResponse.json(user);
// }