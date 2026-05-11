import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, clearSession } from "@/lib/auth/storage";
import { normalizeAxiosError } from "./errors";

export const SESSION_EXPIRED_EVENT = "qeema:session-expired";

export function setupRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });
}

export function setupResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalized = normalizeAxiosError(error);

      if (normalized.status === 401) {
        clearSession();
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }

      return Promise.reject(normalized);
    }
  );
}
