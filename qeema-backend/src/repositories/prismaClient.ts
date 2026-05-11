import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function assertLocalMysqlUrl(): void {
  const raw = process.env["DATABASE_URL"]?.trim() ?? "";
  if (!raw) return;
  if (raw.startsWith("prisma://") || raw.startsWith("prisma+")) {
    throw new Error(
      "DATABASE_URL must be a direct MySQL connection string (mysql://...). " +
        "Remove Prisma Accelerate / Data Platform URLs (prisma://, prisma+...). " +
        "Example: mysql://root:password@localhost:3306/qeema_db"
    );
  }
  if (!raw.startsWith("mysql://")) {
    throw new Error(
      "DATABASE_URL must start with mysql:// for this project. " +
        "Example: mysql://root:password@localhost:3306/qeema_db"
    );
  }
}

assertLocalMysqlUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
