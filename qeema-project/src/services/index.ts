/**
 * Application service layer — API entry points for features.
 * Low-level HTTP lives under `@/lib/api`.
 */
export {
  adminUsersApi,
  authApi,
  requestsApi,
  servicesApi,
} from "@/lib/api";
export type { ServicePayload, ServiceUpdatePayload } from "@/lib/api";
