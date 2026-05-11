import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { authRepository } from "../repositories/auth.repository";
import { AppError } from "../utils/AppError";

const BCRYPT_ROUNDS = 12;

export type SafeUser = Omit<User, "password">;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toSafeUser(user: User): SafeUser {
  const { password: _password, ...rest } = user;
  return rest;
}

function signToken(userId: number): string {
  const secret = process.env["SECRET_KEY"]?.trim();
  if (!secret) {
    throw AppError.internal(
      "JWT SECRET_KEY is not configured. Set SECRET_KEY in .env."
    );
  }
  const expiresIn = (process.env["JWT_EXPIRES_IN"] ?? "7d") as NonNullable<
    SignOptions["expiresIn"]
  >;
  const options: SignOptions = { expiresIn };
  return jwt.sign({ id: userId }, secret, options);
}

export const authService = {
  async registerMobile(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: SafeUser; token: string }> {
    const email = normalizeEmail(input.email);
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await authRepository.createMobileUser({
      name: input.name.trim(),
      email,
      passwordHash,
    });

    const token = signToken(user.id);
    return { user: toSafeUser(user), token };
  },

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: SafeUser; token: string }> {
    const email = normalizeEmail(input.email);
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const token = signToken(user.id);
    return { user: toSafeUser(user), token };
  },
};
