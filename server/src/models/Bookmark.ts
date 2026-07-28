import mongoose, { Schema } from "mongoose";

const bookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["answer", "note", "flashcard"], required: true },
    targetId: { type: String, required: true },
    title: { type: String, required: true }
  },
  { timestamps: true }
);

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

