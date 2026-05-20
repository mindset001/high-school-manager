import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  fileUrl?: string;
  textResponse?: string;
  grade?: number;
  feedback?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    fileUrl: {
      type: String,
    },
    textResponse: {
      type: String,
    },
    grade: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ assignment: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true }); // A student can submit to an assignment only once

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
