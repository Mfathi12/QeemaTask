import type { ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

const isProd = process.env["NODE_ENV"] === "production";

function statusFromLegacyCause(err: Error): number | undefined {
  const c = err.cause;
  return typeof c === "number" && c >= 400 && c < 600 ? c : undefined;
}

/**
 * Centralized error handler: AppError, JWT errors, legacy `{ cause: status }` errors,
 * and safe defaults in production (no stack leakage).
 */
export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
): void => {
  let statusCode = 500;
  let message = isProd ? "Something went wrong" : "Internal server error";
  let code: string | undefined;
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
    if (isProd && statusCode >= 500 && !err.isOperational) {
      message = "Something went wrong";
    }
  } else if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (err instanceof Error) {
    const legacy = statusFromLegacyCause(err);
    if (legacy !== undefined) {
      statusCode = legacy;
      message = err.message;
    } else {
      message = isProd ? "Something went wrong" : err.message;
    }
  } else {
    message = isProd ? "Something went wrong" : String(err);
  }

  if (isProd && statusCode >= 500 && !(err instanceof AppError)) {
    message = "Something went wrong";
  }

  const body: Record<string, unknown> = {
    success: false,
    message,
  };

  if (code) {
    body["code"] = code;
  }

  const exposeDetails =
    !isProd &&
    details !== undefined &&
    statusCode < 500;

  if (exposeDetails) {
    body["details"] = details;
  }

  if (!isProd && statusCode >= 500 && err instanceof Error && err.stack) {
    body["stack"] = err.stack;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(body);
};
