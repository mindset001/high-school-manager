import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffAttendanceRecord {
  staff: mongoose.Types.ObjectId;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  remarks?: string;
}

export interface IStaffAttendance extends Document {
  date: string; // YYYY-MM-DD
  records: IStaffAttendanceRecord[];
  recordedBy: mongoose.Types.ObjectId; // Admin ID
  createdAt: Date;
  updatedAt: Date;
}

const staffAttendanceRecordSchema = new Schema<IStaffAttendanceRecord>({
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'On Leave'], required: true, default: 'Present' },
  remarks: { type: String },
});

const staffAttendanceSchema = new Schema<IStaffAttendance>(
  {
    date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
    records: [staffAttendanceRecordSchema],
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const StaffAttendance = mongoose.model<IStaffAttendance>('StaffAttendance', staffAttendanceSchema);
