import type {
  Paginated,
  RequestStatus,
  Service,
  ServiceRequest,
  UserPublic,
} from "@/types/models";
import type { ApiEnvelope } from "./types";
import { api } from "./client";

/** Authentication */
export const authApi = {
  login(email: string, password: string) {
    return api.post<
      ApiEnvelope<{ user: UserPublic; token: string }>
    >("/api/auth/login", { email, password });
  },
};

export type ServicePayload = {
  name: string;
  category: string;
  price: number;
};

export type ServiceUpdatePayload = Partial<ServicePayload>;

/** Services catalog */
export const servicesApi = {
  list() {
    return api.get<ApiEnvelope<Service[]>>("/api/services");
  },

  create(body: ServicePayload) {
    return api.post<ApiEnvelope<Service>>("/api/services", body);
  },

  update(id: number, body: ServiceUpdatePayload) {
    return api.patch<ApiEnvelope<Service>>(`/api/services/${id}`, body);
  },

  delete(id: number) {
    return api.delete<ApiEnvelope<null>>(`/api/services/${id}`);
  },
};

/** Service requests */
export const requestsApi = {
  list() {
    return api.get<ApiEnvelope<ServiceRequest[]>>("/api/requests");
  },

  patchStatus(id: number, status: RequestStatus) {
    return api.patch<ApiEnvelope<ServiceRequest>>(
      `/api/requests/${id}/status`,
      { status }
    );
  },
};

/** Admin user management */
export const adminUsersApi = {
  list(params: { page: number; limit: number }) {
    return api.get<ApiEnvelope<Paginated<UserPublic>>>("/api/admin/users", {
      params,
    });
  },

  /** First page with minimal limit — useful for total count only. */
  summary() {
    return api.get<ApiEnvelope<Paginated<UserPublic>>>("/api/admin/users", {
      params: { page: 1, limit: 1 },
    });
  },
};
