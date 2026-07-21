export class HttpError extends Error {
  status: number;

  constructor(
    status: number,
    message: string
  ) {
    super(message);

    this.status = status;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Validation Error") {
    super(422, message);
  }
}