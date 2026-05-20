import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: string; // The String studentId e.g. HSM001
  answers: number[]; // Index of selected option per question (-1 for unanswered)
  score: number;
  totalPoints: number;
  startTime: Date;
  submitTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: String, required: true },
    answers: [{ type: Number, required: true }],
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    startTime: { type: Date, required: true },
    submitTime: { type: Date, required: true },
  },
  { timestamps: true }
);

// A student can only have one attempt per quiz
quizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
