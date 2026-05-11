import type { CookieOptions, Request, Response } from "express";
import { authService } from "../services/auth.service";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

const msPerDay = 24 * 60 * 60 * 1000;

function cookieOptions(): CookieOptions {
  const maxAgeDays = Number(process.env["JWT_COOKIE_MAX_AGE_DAYS"] ?? 7);
  return {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: maxAgeDays * msPerDay,
    path: "/",
  };
}

function parseCredentials(body: unknown): {
  name?: string;
  email?: string;
  password?: string;
} {
  if (typeof body !== "object" || body === null) {
    return {};
  }
  const b = body as Record<string, unknown>;
  return {
    name: typeof b.name === "string" ? b.name : undefined,
    email: typeof b.email === "string" ? b.email : undefined,
    password: typeof b.password === "string" ? b.password : undefined,
  };
}

export const registerMobile = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = parseCredentials(req.body);
    if (
      name === undefined ||
      email === undefined ||
      password === undefined ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      throw AppError.badRequest("Name, email, and password are required");
    }

    const result = await authService.registerMobile({
      name,
      email,
      password,
    });

    res.cookie("token", result.token, cookieOptions());

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  }
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = parseCredentials(req.body);
  if (
    email === undefined ||
    password === undefined ||
    !email.trim() ||
    !password
  ) {
    throw AppError.badRequest("Email and password are required");
  }

  const result = await authService.login({ email, password });

  res.cookie("token", result.token, cookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
      token: result.token,
    },
  });
});
