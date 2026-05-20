import mongoose, { Schema, Document } from 'mongoose';

export interface IPeriod {
  startTime: string;
  endTime: string;
  subject?: mongoose.Types.ObjectId;
  teacher?: mongoose.Types.ObjectId;
  isBreak: boolean;
  label?: string; // e.g. "Break", "Assembly", "Lunch"
}

export interface IDaySchedule {
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  periods: IPeriod[];
}

export interface ITimetable extends Document {
  class: string; // e.g. "JSS 1"
  term: string; // e.g. "First Term"
  days: IDaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

const periodSchema = new Schema<IPeriod>({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  teacher: { type: Schema.Types.ObjectId, ref: 'Staff' },
  isBreak: { type: Boolean, default: false },
  label: { type: String },
});

const dayScheduleSchema = new Schema<IDaySchedule>({
  dayOfWeek: { type: String, required: true },
  periods: [periodSchema],
});

const timetableSchema = new Schema<ITimetable>(
  {
    class: { type: String, required: true },
    term: { type: String, required: true, default: 'Current Term' },
    days: [dayScheduleSchema],
  },
  { timestamps: true }
);

// Ensure there is only one timetable per class per term
timetableSchema.index({ class: 1, term: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);
