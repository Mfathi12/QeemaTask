import { Router, type Request, type Response } from "express";
import { adminUserRouter } from "./adminUser.routes";
import { authRouter } from "./auth.routes";
import { requestRouter } from "./request.routes";
import { serviceRouter } from "./service.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/services", serviceRouter);
apiRouter.use("/requests", requestRouter);
apiRouter.use("/admin/users", adminUserRouter);

apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "OK", data: { status: "healthy" } });
});
