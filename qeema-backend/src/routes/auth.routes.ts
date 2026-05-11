import { Router } from "express";
import { login, registerMobile } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", registerMobile);
authRouter.post("/login", login);
