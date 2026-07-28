import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";
import { aiRouter } from "./routes/ai.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { documentRouter } from "./routes/document.routes.js";
import { progressRouter } from "./routes/progress.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173", credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "learnai-api" }));

  app.use("/api/auth", authRouter);
  app.use("/api/documents", documentRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/progress", progressRouter);

  app.use(errorHandler);

  return app;
}

