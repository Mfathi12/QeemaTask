import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} from "../controllers/service.controller";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorization";

export const serviceRouter = Router();

/** Mobile users and admins can browse services */
serviceRouter.get(
  "/",
  authenticate,
  authorize(Role.MOBILE_USER, Role.ADMIN),
  listServices
);

serviceRouter.get(
  "/:id",
  authenticate,
  authorize(Role.MOBILE_USER, Role.ADMIN),
  getService
);

/** Only admins can modify services */
serviceRouter.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  createService
);

serviceRouter.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  updateService
);

serviceRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  deleteService
);
