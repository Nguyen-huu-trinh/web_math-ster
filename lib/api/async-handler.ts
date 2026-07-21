import { handleError } from "./handle-error";

export function asyncHandler(
  handler: () => Promise<Response>
) {
  return async () => {
    try {
      return await handler();
    } catch (error) {
      return handleError(error);
    }
  };
}