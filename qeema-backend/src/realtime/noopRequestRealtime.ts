import type { RequestRealtimePort } from "./requestRealtime.port";

export const noopRequestRealtime: RequestRealtimePort = {
  emitNewRequest(): void {},
  emitRequestStatusUpdated(): void {},
};
