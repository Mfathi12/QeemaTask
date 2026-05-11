import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "../controllers/adminUser.controller";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorization";

export const adminUserRouter = Router();

adminUserRouter.get("/", authenticate, authorize(Role.ADMIN), listAdminUsers);
adminUserRouter.get("/:id", authenticate, authorize(Role.ADMIN), getAdminUser);
adminUserRouter.post("/", authenticate, authorize(Role.ADMIN), createAdminUser);
adminUserRouter.patch("/:id", authenticate, authorize(Role.ADMIN), updateAdminUser);
adminUserRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  deleteAdminUser
);
