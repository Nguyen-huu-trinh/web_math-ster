// import { NextResponse } from "next/server";
// import { userService } from "@/services/user.service";

// export async function GET() {
//   const students =
//     await userService.getStudents();

//   const teachers =
//     await userService.getTeachers();

//   return NextResponse.json({
//     students,
//     teachers,
//   });
// }

// export async function POST(request: Request) {
//   const body = await request.json();

//   const user = await userService.create(body);

//   return NextResponse.json(user);
// }