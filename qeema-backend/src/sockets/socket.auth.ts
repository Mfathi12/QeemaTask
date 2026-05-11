import jwt from "jsonwebtoken";
import type { Server } from "socket.io";
import { prisma } from "../repositories/prismaClient";

export const ADMIN_ROOM = "admin";

/**
 * Handshake middleware: optional JWT in `handshake.auth.token`.
 * Admins join room {@link ADMIN_ROOM} for dashboard broadcasts.
 */
export function registerSocketAuthMiddleware(io: Server): void {
  io.use(async (socket, next) => {
    try {
      const auth = socket.handshake.auth as Record<string, unknown> | undefined;
      const token =
        typeof auth?.["token"] === "string" ? auth["token"] : undefined;
      if (!token) {
        next();
        return;
      }
      const secret = process.env["SECRET_KEY"];
      if (!secret) {
        next();
        return;
      }
      const payload = jwt.verify(token, secret);
      if (typeof payload === "string" || !payload || !("id" in payload)) {
        next();
        return;
      }
      const rawId = (payload as { id?: unknown }).id;
      const userId =
        typeof rawId === "number"
          ? rawId
          : typeof rawId === "string"
            ? Number.parseInt(rawId, 10)
            : NaN;
      if (!Number.isInteger(userId) || userId < 1) {
        next();
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role === "ADMIN") {
        await socket.join(ADMIN_ROOM);
      }
      socket.data.userId = userId;
    } catch {
      // Invalid token: allow connection; REST remains authoritative.
    }
    next();
  });
}
