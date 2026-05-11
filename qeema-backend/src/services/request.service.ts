import { Role, RequestStatus } from "@prisma/client";
import type { RequestWithRelations } from "../repositories/request.repository";
import { requestRepository } from "../repositories/request.repository";
import { serviceRepository } from "../repositories/service.repository";
import type { RequestRealtimePort } from "../realtime/requestRealtime.port";
import { noopRequestRealtime } from "../realtime/noopRequestRealtime";
import type {
  ServiceRequestResponse,
  UpdateRequestStatusDto,
} from "../types/request.dto";
import type { ServiceResponse } from "../types/service.dto";
import { AppError } from "../utils/AppError";

function toServiceResponse(
  row: RequestWithRelations["service"]
): ServiceResponse {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price.toNumber(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toRequestResponse(row: RequestWithRelations): ServiceRequestResponse {
  return {
    id: row.id,
    userId: row.userId,
    serviceId: row.serviceId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    user: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      role: row.user.role,
    },
    service: toServiceResponse(row.service),
  };
}

function parseServiceId(body: unknown): number {
  if (typeof body !== "object" || body === null) {
    throw AppError.badRequest("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const raw = b.serviceId;
  const id =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number.parseInt(raw, 10)
        : NaN;
  if (!Number.isInteger(id) || id < 1) {
    throw AppError.badRequest("Valid serviceId is required");
  }
  return id;
}

function parseRequestId(param: string | string[] | undefined): number {
  const raw =
    typeof param === "string"
      ? param
      : Array.isArray(param)
        ? param[0]
        : undefined;
  if (raw === undefined) {
    throw AppError.badRequest("Request id is required");
  }
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw AppError.badRequest("Invalid request id");
  }
  return id;
}

function parseStatusUpdate(body: unknown): UpdateRequestStatusDto {
  if (typeof body !== "object" || body === null) {
    throw AppError.badRequest("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const status = b.status;
  if (
    status !== RequestStatus.PENDING &&
    status !== RequestStatus.IN_PROGRESS &&
    status !== RequestStatus.COMPLETED
  ) {
    throw AppError.badRequest(
      "status must be PENDING, IN_PROGRESS, or COMPLETED"
    );
  }
  return { status };
}

export type RequestServiceApi = {
  createForMobileUser(userId: number, body: unknown): Promise<ServiceRequestResponse>;
  listForRole(role: Role, userId: number): Promise<ServiceRequestResponse[]>;
  getByIdForRole(
    id: number,
    role: Role,
    userId: number
  ): Promise<ServiceRequestResponse>;
  updateStatusByAdmin(
    id: number,
    body: unknown
  ): Promise<ServiceRequestResponse>;
};

export function createRequestService(
  realtime: RequestRealtimePort
): RequestServiceApi {
  return {
    async createForMobileUser(userId: number, body: unknown) {
      const serviceId = parseServiceId(body);
      const service = await serviceRepository.findById(serviceId);
      if (!service) {
        throw AppError.notFound("Service not found");
      }

      const row = await requestRepository.create(userId, serviceId);
      const payload = toRequestResponse(row);
      realtime.emitNewRequest(payload);
      return payload;
    },

    async listForRole(role: Role, userId: number) {
      const rows =
        role === Role.ADMIN
          ? await requestRepository.findAll()
          : await requestRepository.findManyForUser(userId);
      return rows.map(toRequestResponse);
    },

    async getByIdForRole(id: number, role: Role, userId: number) {
      const row = await requestRepository.findById(id);
      if (!row) {
        throw AppError.notFound("Request not found");
      }
      if (role !== Role.ADMIN && row.userId !== userId) {
        throw AppError.forbidden("You cannot access this request");
      }
      return toRequestResponse(row);
    },

    async updateStatusByAdmin(id: number, body: unknown) {
      const row = await requestRepository.findById(id);
      if (!row) {
        throw AppError.notFound("Request not found");
      }
      const { status } = parseStatusUpdate(body);
      const updated = await requestRepository.updateStatus(id, status);
      const payload = toRequestResponse(updated);
      realtime.emitRequestStatusUpdated(payload);
      return payload;
    },
  };
}

/** Mutable delegate so Socket.io can be wired after HTTP server starts. */
let activeImpl = createRequestService(noopRequestRealtime);

export function wireRequestRealtime(realtime: RequestRealtimePort): void {
  activeImpl = createRequestService(realtime);
}

export const requestService: RequestServiceApi = {
  createForMobileUser: (userId, body) =>
    activeImpl.createForMobileUser(userId, body),
  listForRole: (role, userId) => activeImpl.listForRole(role, userId),
  getByIdForRole: (id, role, userId) =>
    activeImpl.getByIdForRole(id, role, userId),
  updateStatusByAdmin: (id, body) => activeImpl.updateStatusByAdmin(id, body),
};
