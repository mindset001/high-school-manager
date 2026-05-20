import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord {
  student: mongoose.Types.ObjectId;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export interface IAttendance extends Document {
  class: string;
  date: string; // YYYY-MM-DD
  records: IAttendanceRecord[];
  recordedBy: mongoose.Types.ObjectId; // Staff or Admin ID
  createdAt: Date;
  updatedAt: Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true, default: 'Present' },
  remarks: { type: String },
});

const attendanceSchema = new Schema<IAttendance>(
  {
    class: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    records: [attendanceRecordSchema],
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Ensure there is only one attendance sheet per class per day
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
