import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Staff } from '../models/Staff.js';

interface AuthRequest extends Request {
  user?: { userId: string; role: string; };
}

export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, className, subject, durationMinutes, dueDate, questions } = req.body;
    const userId = req.user?.userId;

    // Get the staff profile to attach teacherId
    const staff = await Staff.findOne({ userId });
    if (!staff && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only staff can create quizzes' });
      return;
    }

    const quiz = new Quiz({
      title,
      description,
      class: className,
      subject,
      teacherId: staff?._id, // If admin creates it without staff profile, it might fail schema unless we handle it, but admin can make staff profiles
      durationMinutes,
      dueDate,
      questions,
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className } = req.query;
    const filter: any = { isActive: true };
    if (className) filter.class = className;

    const quizzes = await Quiz.find(filter)
      .select('-questions.correctOptionIndex') // hide answers from general fetch
      .populate('teacherId', 'staffId')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const role = req.user?.role;

    const quiz = await Quiz.findById(id).populate({
      path: 'teacherId',
      populate: { path: 'userId', select: 'firstName lastName' }
    });

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    // Convert to object so we can strip answers if needed
    const quizObj = quiz.toObject();

    // If it's a student/guardian, remove correct answers for security
    if (role === 'student' || role === 'guardian') {
      quizObj.questions.forEach((q: any) => {
        delete q.correctOptionIndex;
      });
    }

    res.json(quizObj);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { studentId, answers, startTime, submitTime } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q, index) => {
      totalPoints += q.points;
      if (answers[index] === q.correctOptionIndex) {
        score += q.points;
      }
    });

    const attempt = new QuizAttempt({
      quizId: id,
      studentId,
      answers,
      score,
      totalPoints,
      startTime: new Date(startTime),
      submitTime: new Date(submitTime),
    });

    await attempt.save();

    res.status(201).json({ 
      message: 'Quiz submitted successfully', 
      result: { score, totalPoints } 
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already submitted this quiz' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

export const getQuizSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const attempts = await QuizAttempt.find({ quizId: id }).sort({ submitTime: -1 });
    res.json(attempts);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentQuizAttempts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const attempts = await QuizAttempt.find({ studentId }).populate('quizId', 'title subject durationMinutes totalPoints');
    res.json(attempts);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
