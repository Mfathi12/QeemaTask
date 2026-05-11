import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` middleware after JWT verification. */
      user?: User;
    }
  }
}

export {};
