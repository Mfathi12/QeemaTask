import { toast as toastify, type ToastOptions } from "react-toastify";

const defaults: ToastOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
};

export const toast = {
  success: (msg: string, opts?: ToastOptions) =>
    toastify.success(msg, { ...defaults, ...opts }),
  error: (msg: string, opts?: ToastOptions) =>
    toastify.error(msg, { ...defaults, ...opts }),
  info: (msg: string, opts?: ToastOptions) =>
    toastify.info(msg, { ...defaults, ...opts }),
  warning: (msg: string, opts?: ToastOptions) =>
    toastify.warning(msg, { ...defaults, ...opts }),
};
