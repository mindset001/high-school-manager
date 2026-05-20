import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Get all assignments (filtered by class for students/guardians, or by teacher for staff)
export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { class: className } = req.query;
    let query: any = {};
    
    if (className) {
      query.class = className;
    }
    
    // If staff, only show their assignments or all if admin
    if (req.user?.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId });
      if (staff) {
        query.teacher = staff._id;
      }
    }

    const assignments = await Assignment.find(query)
      .populate('subject', 'name')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new assignment
export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, class: className, subject, dueDate } = req.body;
    
    let fileUrl;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'high-school-manager/assignments');
      fileUrl = uploadResult.url;
      // Clean up local file
      fs.unlinkSync(req.file.path);
    }

    const staff = await Staff.findOne({ userId: req.user?.userId });
    if (!staff) {
      res.status(403).json({ message: 'Only staff can create assignments' });
      return;
    }

    const assignment = new Assignment({
      title,
      description,
      class: className,
      subject,
      teacher: staff._id,
      dueDate,
      fileUrl,
    });

    await assignment.save();
    
    // Populate before returning
    await assignment.populate('subject', 'name');
    await assignment.populate('teacher', 'firstName lastName');

    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Submissions for an assignment
export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    
    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName studentId class')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a student's submission for an assignment
export const getStudentSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId, studentId } = req.params;
    
    const submission = await Submission.findOne({ 
      assignment: assignmentId,
      student: studentId
    });

    res.json(submission || null);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit an assignment
export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId, textResponse, studentId } = req.body;
    
    let fileUrl;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'high-school-manager/submissions');
      fileUrl = uploadResult.url;
      // Clean up local file
      fs.unlinkSync(req.file.path);
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    });

    if (existingSubmission) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(400).json({ message: 'Already submitted for this assignment' });
      return;
    }

    const submission = new Submission({
      assignment: assignmentId,
      student: studentId,
      textResponse,
      fileUrl,
    });

    await submission.save();
    res.status(201).json({ message: 'Assignment submitted successfully', submission });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Grade a submission
export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { grade, feedback },
      { new: true }
    );

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    res.json({ message: 'Submission graded successfully', submission });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
