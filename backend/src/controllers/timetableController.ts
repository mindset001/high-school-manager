import { Request, Response } from 'express';
import { Timetable } from '../models/Timetable.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const getTimetable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className } = req.params;
    const { term } = req.query; // optional

    const query: any = { class: className };
    if (term) query.term = term;

    const timetable = await Timetable.findOne(query)
      .populate('days.periods.subject', 'name code')
      .populate('days.periods.teacher', 'firstName lastName');

    if (!timetable) {
      res.status(404).json({ message: 'Timetable not found for this class' });
      return;
    }

    res.json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveTimetable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className } = req.params;
    const { term = 'Current Term', days } = req.body;

    // Validate admin role
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only admins can modify timetables' });
      return;
    }

    let timetable = await Timetable.findOne({ class: className, term });

    if (timetable) {
      timetable.days = days;
      await timetable.save();
    } else {
      timetable = new Timetable({
        class: className,
        term,
        days,
      });
      await timetable.save();
    }

    // Populate before sending response
    await timetable.populate('days.periods.subject', 'name code');
    await timetable.populate('days.periods.teacher', 'firstName lastName');

    res.json({ message: 'Timetable saved successfully', timetable });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
