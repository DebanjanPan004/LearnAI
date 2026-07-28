import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["pdf", "docx", "txt", "markdown", "ppt"], required: true },
    url: { type: String, required: true },
    chunks: [{ type: Schema.Types.ObjectId, ref: "Chunk" }]
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);

