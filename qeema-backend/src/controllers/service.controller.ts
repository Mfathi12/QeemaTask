import type { Request, Response } from "express";
import { serviceManagement } from "../services/service.service";
import { asyncHandler } from "../utils/asyncHandler";

export const listServices = asyncHandler(async (_req: Request, res: Response) => {
  const data = await serviceManagement.list();
  res.status(200).json({
    success: true,
    message: "Services retrieved successfully",
    data,
  });
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const id = serviceManagement.parseServiceId(req.params["id"]);
  const data = await serviceManagement.getById(id);
  res.status(200).json({
    success: true,
    message: "Service retrieved successfully",
    data,
  });
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const data = await serviceManagement.create(req.body);
  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data,
  });
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const id = serviceManagement.parseServiceId(req.params["id"]);
  const data = await serviceManagement.update(id, req.body);
  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    data,
  });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const id = serviceManagement.parseServiceId(req.params["id"]);
  await serviceManagement.remove(id);
  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
    data: null,
  });
});
