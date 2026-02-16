import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  class: string;
  section?: string;
  admissionDate: Date;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  guardianId?: mongoose.Types.ObjectId;
  bloodGroup?: string;
  medicalConditions?: string[];
  previousSchool?: string;
  documents?: {
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  academicRecords?: {
    term: string;
    year: number;
    results: {
      subject: string;
      score: number;
      grade: string;
    }[];
  }[];
  attendance?: {
    date: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    guardianId: {
      type: Schema.Types.ObjectId,
      ref: 'Guardian',
    },
    bloodGroup: {
      type: String,
    },
    medicalConditions: [String],
    previousSchool: {
      type: String,
    },
    documents: [
      {
        type: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    academicRecords: [
      {
        term: String,
        year: Number,
        results: [
          {
            subject: String,
            score: Number,
            grade: String,
          },
        ],
      },
    ],
    attendance: [
      {
        date: Date,
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ studentId: 1 });
studentSchema.index({ class: 1 });
studentSchema.index({ userId: 1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
