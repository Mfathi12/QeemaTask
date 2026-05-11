import type { ServerOptions } from "socket.io";

/**
 * Builds Socket.io server options shared across environments.
 * Align CORS with Express (`CORS_ORIGIN`) so browser clients match REST.
 */
export function createSocketServerOptions(): Partial<ServerOptions> {
  return {
    cors: {
      origin: process.env["CORS_ORIGIN"] ?? true,
      credentials: true,
    },
  };
}
