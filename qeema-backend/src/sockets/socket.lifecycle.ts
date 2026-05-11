import type { Server } from "socket.io";

/**
 * Logs client connect/disconnect. Runs after handshake middleware.
 */
export function registerConnectionLifecycle(io: Server): void {
  io.on("connection", (socket) => {
    const label =
      socket.data.userId != null
        ? `userId=${String(socket.data.userId)}`
        : "anonymous";

    console.log(
      `[socket] connected id=${socket.id} transport=${socket.conn.transport.name} (${label})`
    );

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected id=${socket.id} reason=${reason}`);
    });
  });
}
