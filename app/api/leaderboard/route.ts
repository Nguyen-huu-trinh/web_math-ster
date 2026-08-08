import { NextResponse } from "next/server";

import {
  leaderboardRepository,
} from "@/repositories/leaderboard.repository";

export async function GET() {

  try {

    const [

      overall,

      latest,

      lazy,

      lowHomework,

      hardworking,

      excellent,

    ] = await Promise.all([

      leaderboardRepository.overall(),

      leaderboardRepository.latest(),

      leaderboardRepository.lazyStudents(),

      leaderboardRepository.lowHomeworkStudents(),

      leaderboardRepository.hardworkingStudents(),

      leaderboardRepository.excellentStudents(),

    ]);

    return NextResponse.json({

      overall,

      latest,

      lazy,

      lowHomework,

      hardworking,

      excellent,

    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(

      {
        message: "Failed to load leaderboard.",
      },

      {
        status: 500,
      }

    );

  }

}