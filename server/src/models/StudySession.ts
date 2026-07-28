import mongoose, { Schema } from "mongoose";

const studySessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    minutes: { type: Number, required: true },
    completedAt: Date
  },
  { timestamps: true }
);

export const StudySession = mongoose.model("StudySession", studySessionSchema);

