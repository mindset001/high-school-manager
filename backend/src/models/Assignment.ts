import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description?: string;
  class: string;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dueDate: Date;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    class: {
      type: String,
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    fileUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ class: 1 });
assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ teacher: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
