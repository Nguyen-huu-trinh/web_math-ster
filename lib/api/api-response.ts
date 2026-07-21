import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export function success<T>(
  data?: T,
  message = "Success",
  status = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
    },
    {
      status,
    }
  );
}

export function created<T>(
  data?: T,
  message = "Created"
) {
  return success(data, message, 201);
}

export function fail(
  message = "Bad Request",
  status = 400
) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message,
    },
    {
      status,
    }
  );
}