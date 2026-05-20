import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  points: number;
}

export interface IQuiz {
  _id: string;
  title: string;
  description: string;
  class: string;
  subject: string;
  durationMinutes: number;
  dueDate: string;
  questions: IQuestion[];
  isActive: boolean;
  createdAt: string;
}

export interface IQuizAttempt {
  _id: string;
  quizId: string | IQuiz;
  studentId: string;
  answers: number[];
  score: number;
  totalPoints: number;
  startTime: string;
  submitTime: string;
}

export const fetchQuizzes = async (className?: string) => {
  const url = className ? `/quizzes?className=${encodeURIComponent(className)}` : '/quizzes';
  const response = await apiClient.get(url);
  return response.data as IQuiz[];
};

export const fetchQuizById = async (id: string) => {
  const response = await apiClient.get(`/quizzes/${id}`);
  return response.data as IQuiz;
};

export const createQuiz = async (quizData: Partial<IQuiz>) => {
  const response = await apiClient.post('/quizzes', quizData);
  return response.data;
};

export const submitQuiz = async (id: string, attemptData: { studentId: string; answers: number[]; startTime: string; submitTime: string }) => {
  const response = await apiClient.post(`/quizzes/${id}/submit`, attemptData);
  return response.data;
};

export const fetchQuizSubmissions = async (id: string) => {
  const response = await apiClient.get(`/quizzes/${id}/submissions`);
  return response.data as IQuizAttempt[];
};

export const fetchStudentQuizAttempts = async (studentId: string) => {
  const response = await apiClient.get(`/quizzes/student/${encodeURIComponent(studentId)}`);
  return response.data as IQuizAttempt[];
};

// React Query Hooks

export const useQuizzes = (className?: string) => {
  return useQuery({
    queryKey: ['quizzes', className],
    queryFn: () => fetchQuizzes(className),
  });
};

export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => fetchQuizById(id),
    enabled: !!id,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string, attemptData: any }) => submitQuiz(data.id, data.attemptData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizAttempts', variables.attemptData.studentId] });
      queryClient.invalidateQueries({ queryKey: ['quizSubmissions', variables.id] });
    },
  });
};

export const useQuizSubmissions = (id: string) => {
  return useQuery({
    queryKey: ['quizSubmissions', id],
    queryFn: () => fetchQuizSubmissions(id),
    enabled: !!id,
  });
};

export const useStudentQuizAttempts = (studentId: string) => {
  return useQuery({
    queryKey: ['quizAttempts', studentId],
    queryFn: () => fetchStudentQuizAttempts(studentId),
    enabled: !!studentId,
  });
};
