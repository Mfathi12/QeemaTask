import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createRequest,
  getRequest,
  listRequests,
  patchRequestStatus,
} from "../controllers/request.controller";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorization";

export const requestRouter = Router();

requestRouter.post(
  "/",
  authenticate,
  authorize(Role.MOBILE_USER),
  createRequest
);

requestRouter.get(
  "/",
  authenticate,
  authorize(Role.MOBILE_USER, Role.ADMIN),
  listRequests
);

requestRouter.get(
  "/:id",
  authenticate,
  authorize(Role.MOBILE_USER, Role.ADMIN),
  getRequest
);

requestRouter.patch(
  "/:id/status",
  authenticate,
  authorize(Role.ADMIN),
  patchRequestStatus
);
