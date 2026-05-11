import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../repositories/prismaClient";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

function headerString(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function getBearerToken(req: Request): string | undefined {
  const fromCookie =
    typeof req.cookies?.token === "string" ? req.cookies.token : undefined;

  const headers = req.headers as Record<
    string,
    string | string[] | undefined
  >;
  const fromHeader = headerString(headers["token"]);
  const authRaw = headerString(headers["authorization"]);
  const fromAuth = authRaw?.replace(/^Bearer\s+/i, "").trim();
  return fromCookie ?? fromHeader ?? fromAuth;
}

/**
 * Requires a valid JWT (cookie `token`, header `token`, or `Authorization: Bearer`).
 * Attaches the Prisma user to `req.user`.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = getBearerToken(req);
    if (!token) {
      next(
        new AppError("No token provided, authorization denied", 401, {
          code: "NO_TOKEN",
        })
      );
      return;
    }

    const secret = process.env["SECRET_KEY"];
    if (!secret) {
      next(AppError.internal());
      return;
    }

    try {
      const payload = jwt.verify(token, secret);
      if (typeof payload === "string" || !("id" in payload) || !payload.id) {
        next(AppError.unauthorized("Token is not valid"));
        return;
      }

      const rawId = payload.id;
      const userId =
        typeof rawId === "number"
          ? rawId
          : typeof rawId === "string"
            ? Number.parseInt(rawId, 10)
            : NaN;

      if (!Number.isInteger(userId) || userId < 1) {
        next(AppError.unauthorized("Token is not valid"));
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        next(AppError.unauthorized("User not found, authentication denied"));
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        next(AppError.unauthorized("Token expired"));
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        next(AppError.unauthorized("Token is not valid"));
        return;
      }
      next(error);
    }
  }
);
