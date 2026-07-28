import type { Response } from "express";
import fs from "node:fs/promises";
import type { AuthRequest } from "../middleware/auth.js";
import { Document } from "../models/Document.js";
import { Chunk } from "../models/Chunk.js";
import { extractTextFromFile } from "../services/documentParser.service.js";
import { chunkText } from "../utils/chunkText.js";
import { generateEmbeddingsBatch } from "../services/ai/gemini.service.js";

export async function uploadDocument(req: AuthRequest, res: Response) {
  if (!req.file) return res.status(400).json({ message: "Document file is required" });

  try {
    const text = await extractTextFromFile(req.file);
    const chunkTexts = chunkText(text, 5000);
    const type = req.file.originalname.split(".").pop()?.toLowerCase() ?? "txt";

    // 1. Create document entry
    const document = await Document.create({
      title: req.file.originalname,
      userId: req.userId,
      type,
      url: req.file.path,
      chunks: []
    });

    // Generate embeddings in batch
    let embeddings: number[][] = [];
    if (chunkTexts.length > 0) {
      try {
        embeddings = await generateEmbeddingsBatch(chunkTexts);
      } catch (err) {
        console.error("Embedding generation failed, saving chunks with empty embeddings:", err);
      }
    }

    // 2. Bulk create chunk entries linked to the document
    const chunkDocs = await Chunk.insertMany(
      chunkTexts.map((txt, index) => ({
        documentId: document._id,
        text: txt,
        embedding: embeddings[index] || [],
        pageNumber: index + 1
      }))
    );

    // 3. Link chunks to document
    document.chunks = chunkDocs.map((c) => c._id) as any;
    await document.save();

    res.status(201).json({
      document,
      extractedCharacters: text.length,
      chunkCount: chunkTexts.length
    });
  } catch (error) {
    // Clean up uploaded file if DB operation failed
    if (req.file.path) {
      await fs.unlink(req.file.path).catch((err) => {
        console.error("Failed to delete temp file on error:", err);
      });
    }
    throw error;
  }
}

export async function listDocuments(req: AuthRequest, res: Response) {
  const documents = await Document.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ documents });
}

export async function deleteDocument(req: AuthRequest, res: Response) {
  const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) {
    return res.status(404).json({ message: "Document not found" });
  }

  // 1. Delete associated chunks
  await Chunk.deleteMany({ documentId: doc._id });

  // 2. Delete the physical file
  await fs.unlink(doc.url).catch((err) => {
    console.error("Failed to delete local file:", err);
  });

  // 3. Delete Document record
  await doc.deleteOne();

  res.status(204).send();
}

