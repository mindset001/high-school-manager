import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[]; // Usually 4 options
  correctOptionIndex: number; // 0-based index of the correct option
  points: number;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  class: string;
  subject: string;
  teacherId: mongoose.Types.ObjectId;
  durationMinutes: number;
  dueDate: Date;
  questions: IQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  points: { type: Number, required: true, default: 1 },
});

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    class: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    durationMinutes: { type: Number, required: true, default: 30 },
    dueDate: { type: Date, required: true },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
