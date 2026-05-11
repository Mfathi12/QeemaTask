/** Typical backend JSON envelope from this project’s Express API. */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};
