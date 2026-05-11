import type { RequestStatus, Role } from "@prisma/client";
import type { ServiceResponse } from "./service.dto";

/** Safe user embedded in API responses (no password). */
export interface RequestUserSummary {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface CreateServiceRequestDto {
  serviceId: number;
}

export interface UpdateRequestStatusDto {
  status: RequestStatus;
}

export interface ServiceRequestResponse {
  id: number;
  userId: number;
  serviceId: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  user: RequestUserSummary;
  service: ServiceResponse;
}
