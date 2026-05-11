export type AppErrorOptions = {
  code?: string;
  /** Marks errors safe to expose to clients (vs unexpected failures). Default true. */
  isOperational?: boolean;
  details?: unknown;
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly isOperational: boolean;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    options?: AppErrorOptions
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = options?.code;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;
    Object.setPrototypeOf(this, AppError.prototype);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, { code: "BAD_REQUEST", details });
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, 401, { code: "UNAUTHORIZED" });
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(message, 403, { code: "FORBIDDEN" });
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(message, 404, { code: "NOT_FOUND" });
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, { code: "CONFLICT" });
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError(message, 500, {
      code: "INTERNAL_ERROR",
      isOperational: false,
    });
  }
}
