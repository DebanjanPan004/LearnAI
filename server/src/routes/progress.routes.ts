import { Router } from "express";
import { getProgress, updateProgress } from "../controllers/progress.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const progressRouter = Router();

progressRouter.use(requireAuth);
progressRouter.get("/", getProgress);
progressRouter.post("/", updateProgress);

