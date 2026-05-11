import type { Server } from "socket.io";

let ioRef: Server | null = null;

/** Called once from `attachSocketIO` after the Server is constructed. */
export function registerSocketServer(io: Server): void {
  ioRef = io;
}

/**
 * Returns the Socket.io server instance after bootstrap.
 * @throws If `attachSocketIO()` has not run yet (e.g. imported too early).
 */
export function getSocketIo(): Server {
  if (!ioRef) {
    throw new Error(
      "Socket.io is not initialized. Call attachSocketIO() from server bootstrap first."
    );
  }
  return ioRef;
}

/** Safe access when initialization order is uncertain (e.g. tests). */
export function tryGetSocketIo(): Server | null {
  return ioRef;
}
