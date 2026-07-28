import { Router } from "express";
import { deleteDocument, listDocuments, uploadDocument } from "../controllers/document.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../services/upload.service.js";

export const documentRouter = Router();

documentRouter.use(requireAuth);
documentRouter.post("/upload", upload.single("document"), uploadDocument);
documentRouter.get("/", listDocuments);
documentRouter.delete("/:id", deleteDocument);

