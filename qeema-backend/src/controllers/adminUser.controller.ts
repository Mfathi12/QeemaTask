import type { Request, Response } from "express";
import type { User } from "@prisma/client";
import { adminUserService } from "../services/adminUser.service";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: User } {
  const user = (req as Request & { user?: User }).user;
  if (!user) {
    throw AppError.unauthorized();
  }
}

export const listAdminUsers = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const data = await adminUserService.list(req.query as Record<string, unknown>);
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data,
  });
});

export const getAdminUser = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const id = adminUserService.parseUserId(req.params["id"]);
  const data = await adminUserService.getById(id);
  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data,
  });
});

export const createAdminUser = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const data = await adminUserService.create(req.body);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data,
  });
});

export const updateAdminUser = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const id = adminUserService.parseUserId(req.params["id"]);
  const data = await adminUserService.update(id, req.body);
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data,
  });
});

export const deleteAdminUser = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const id = adminUserService.parseUserId(req.params["id"]);
  await adminUserService.delete(req.user.id, id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});
