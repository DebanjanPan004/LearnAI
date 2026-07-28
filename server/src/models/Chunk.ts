import mongoose, { Schema } from "mongoose";

const chunkSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
    text: { type: String, required: true },
    embedding: [Number],
    pageNumber: Number
  },
  { timestamps: true }
);

export const Chunk = mongoose.model("Chunk", chunkSchema);

