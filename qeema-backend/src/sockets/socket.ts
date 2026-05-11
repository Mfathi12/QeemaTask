import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { RequestRealtimePort } from "../realtime/requestRealtime.port";
import type { ServiceRequestResponse } from "../types/request.dto";
import { ADMIN_ROOM, registerSocketAuthMiddleware } from "./socket.auth";
import { createSocketServerOptions } from "./socket.config";
import { registerConnectionLifecycle } from "./socket.lifecycle";
import { registerSocketServer } from "./socket.registry";

export type AttachSocketIOResult = {
  io: Server;
  realtime: RequestRealtimePort;
};

/**
 * Attaches Socket.io to the HTTP server, wires auth + lifecycle logging,
 * registers the shared {@link Server} for {@link getSocketIo}, and exposes realtime emits for requests.
 */
export function attachSocketIO(httpServer: HttpServer): AttachSocketIOResult {
  const io = new Server(httpServer, createSocketServerOptions());

  registerSocketServer(io);
  registerSocketAuthMiddleware(io);
  registerConnectionLifecycle(io);

  const realtime: RequestRealtimePort = {
    emitNewRequest(payload: ServiceRequestResponse): void {
      io.to(ADMIN_ROOM).emit("new-request", payload);
    },
    emitRequestStatusUpdated(payload: ServiceRequestResponse): void {
      io.to(ADMIN_ROOM).emit("request-status-updated", payload);
    },
  };

  return { io, realtime };
}
