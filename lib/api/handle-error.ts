import { logServerError } from "@/lib/logging";
import { NextResponse } from "next/server";

import { ZodError } from "zod";

import { HttpError } from "./http-error";

export function handleError(error: unknown) {
  logServerError(error);

  if (error instanceof HttpError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.status,
      }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation Error",
        errors: error.flatten(),
      },
      {
        status: 422,
      }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    {
      status: 500,
    }
  );
}