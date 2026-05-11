import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { apiRouter } from "./routes";

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: process.env["CORS_ORIGIN"] ?? true,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", apiRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Not found",
      code: "NOT_FOUND",
    });
  });

  app.use(errorMiddleware);

  return app;
}
