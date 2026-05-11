import bcrypt from "bcrypt";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../repositories/prismaClient";

function logDbFailure(err: unknown): void {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P5010"
  ) {
    console.error(
      "[seed] P5010: Cannot reach the database service (often prisma:// / Accelerate URL or offline DB). " +
        "Use a direct URL in DATABASE_URL: mysql://USER:PASSWORD@localhost:3306/DB_NAME"
    );
  }
}

const BCRYPT_ROUNDS = 12;

/**
 * Default admin (override with env):
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME
 *
 * Default password: Admin123!
 * Set SEED_DISABLE=true to skip seeding on startup.
 */
const DEFAULT_ADMIN_EMAIL = "admin@qeema.local";
const DEFAULT_ADMIN_PASSWORD = "Admin123!";
const DEFAULT_ADMIN_NAME = "Administrator";

const SAMPLE_SERVICES: { name: string; category: string; price: number }[] = [
  { name: "Network diagnostics", category: "IT Support", price: 49.99 },
  { name: "On-site repair", category: "Field service", price: 120.0 },
  { name: "Priority same-day", category: "Field service", price: 199.0 },
];

export async function runStartupSeed(): Promise<void> {
  if (process.env["SEED_DISABLE"] === "true") {
    console.log("[seed] Skipped (SEED_DISABLE=true).");
    return;
  }

  const email = (
    process.env["SEED_ADMIN_EMAIL"] ?? DEFAULT_ADMIN_EMAIL
  ).trim().toLowerCase();
  const password = process.env["SEED_ADMIN_PASSWORD"] ?? DEFAULT_ADMIN_PASSWORD;
  const name = process.env["SEED_ADMIN_NAME"] ?? DEFAULT_ADMIN_NAME;

  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await prisma.user.create({
        data: {
          email,
          name,
          password: passwordHash,
          role: Role.ADMIN,
        },
      });
      console.log(
        `[seed] Created admin user ${email} (password: env SEED_ADMIN_PASSWORD or default "Admin123!").`
      );
    } else {
      console.log(`[seed] Admin already exists (${email}), skipping.`);
    }

    const count = await prisma.service.count();
    if (count === 0) {
      await prisma.service.createMany({
        data: SAMPLE_SERVICES.map((s) => ({
          name: s.name,
          category: s.category,
          price: new Prisma.Decimal(s.price),
        })),
      });
      console.log("[seed] Created 3 sample services.");
    } else {
      console.log(`[seed] Services present (${count}), skipping catalog seed.`);
    }
  } catch (err) {
    logDbFailure(err);
    console.error("[seed] Failed:", err);
    throw err;
  }
}
