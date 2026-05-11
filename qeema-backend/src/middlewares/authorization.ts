import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

/** Requires `authenticate` first. Restricts access to users whose `role` is in `roles`. */
export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      next(AppError.forbidden("Not authorized for this resource"));
      return;
    }
    next();
  };
