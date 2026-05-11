import axios from "axios";

/** Normalized client-side error with optional HTTP status. */
export class ApiClientError extends Error {
  readonly status: number | undefined;
  readonly body: unknown;

  constructor(
    message: string,
    options?: { status?: number; body?: unknown; cause?: unknown }
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "ApiClientError";
    this.status = options?.status;
    this.body = options?.body;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export function normalizeAxiosError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as { message?: string } | undefined;
    const message =
      body?.message ??
      error.message ??
      (status === 0 ? "Network error" : "Request failed");
    return new ApiClientError(message, {
      status,
      body: error.response?.data,
      cause: error,
    });
  }
  if (error instanceof Error) {
    return new ApiClientError(error.message, { cause: error });
  }
  return new ApiClientError("Unexpected error");
}
