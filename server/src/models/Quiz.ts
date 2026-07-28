import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
  {
    prompt: { type: String, required: true },
    type: { type: String, enum: ["mcq", "fill_blank", "true_false", "short_answer"], required: true },
    options: [String],
    answer: { type: String, required: true }
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    title: { type: String, required: true },
    questions: [questionSchema],
    score: Number,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);

