import type { Request, Response } from "express";
import { requestService } from "../services/request.service";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: NonNullable<Request["user"]> } {
  if (!req.user) {
    throw AppError.unauthorized();
  }
}

export const createRequest = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const data = await requestService.createForMobileUser(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: "Request created successfully",
    data,
  });
});

export const listRequests = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const data = await requestService.listForRole(req.user.role, req.user.id);
  res.status(200).json({
    success: true,
    message: "Requests retrieved successfully",
    data,
  });
});

export const getRequest = asyncHandler(async (req: Request, res: Response) => {
  assertAuthenticated(req);
  const id = parseRequestParam(req.params["id"]);
  const data = await requestService.getByIdForRole(
    id,
    req.user.role,
    req.user.id
  );
  res.status(200).json({
    success: true,
    message: "Request retrieved successfully",
    data,
  });
});

export const patchRequestStatus = asyncHandler(
  async (req: Request, res: Response) => {
    assertAuthenticated(req);
    const id = parseRequestParam(req.params["id"]);
    const data = await requestService.updateStatusByAdmin(id, req.body);
    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      data,
    });
  }
);

function parseRequestParam(param: string | string[] | undefined): number {
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
