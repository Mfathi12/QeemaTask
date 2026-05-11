import type { ServiceRequestResponse } from "../types/request.dto";

/** Outbound real-time notifications for service requests (Socket.io adapter implements this). */
export interface RequestRealtimePort {
  emitNewRequest(payload: ServiceRequestResponse): void;
  emitRequestStatusUpdated(payload: ServiceRequestResponse): void;
}
