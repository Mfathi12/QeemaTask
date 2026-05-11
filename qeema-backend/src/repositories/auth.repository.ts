import { Role } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { prisma } from "./prismaClient";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

export const authRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async createMobileUser(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    try {
      return await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.passwordHash,
          role: Role.MOBILE_USER,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw AppError.conflict("Email is already registered");
      }
      throw error;
    }
  },
};
