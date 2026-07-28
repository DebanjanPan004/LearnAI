import mongoose, { Schema } from "mongoose";

const progressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    studyTime: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    topicsCompleted: { type: Number, default: 0 },
    weakTopics: [String]
  },
  { timestamps: true }
);

export const Progress = mongoose.model("Progress", progressSchema);

