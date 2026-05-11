import axios from "axios";
import { getApiBaseUrl } from "@/lib/config/env";
import { setupRequestInterceptor, setupResponseInterceptor } from "./interceptors";

function createHttpClient(): ReturnType<typeof axios.create> {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    timeout: 30_000,
  });

  setupRequestInterceptor(client);
  setupResponseInterceptor(client);

  return client;
}

/** Shared Axios instance for the app. */
export const api = createHttpClient();
