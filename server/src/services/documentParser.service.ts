import fs from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
// @ts-ignore
import pdfParse from "pdf-parse";

export async function extractTextFromFile(file: Express.Multer.File) {
  const extension = path.extname(file.originalname).toLowerCase();
  const buffer = await fs.readFile(file.path);

  if (extension === ".pdf") {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  if (extension === ".docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  return buffer.toString("utf8");
}

