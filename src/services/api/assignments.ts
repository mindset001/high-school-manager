import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./apiClient";

export const fetchAssignments = async (className?: string) => {
  const params = className ? { class: className } : {};
  const response = await apiClient.get('/assignments', { params });
  return response.data;
};

export const createAssignment = async (formData: FormData) => {
  const response = await apiClient.post('/assignments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchSubmissions = async (assignmentId: string) => {
  const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
  return response.data;
};

export const fetchStudentSubmission = async (assignmentId: string, studentId: string) => {
  const response = await apiClient.get(`/assignments/${assignmentId}/submissions/${studentId}`);
  return response.data;
};

export const submitAssignment = async (formData: FormData) => {
  const response = await apiClient.post('/assignments/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const gradeSubmission = async ({ submissionId, data }: { submissionId: string, data: { grade: number, feedback: string } }) => {
  const response = await apiClient.put(`/assignments/submissions/${submissionId}/grade`, data);
  return response.data;
};

// React Query Hooks

export const useAssignments = (className?: string) => {
  return useQuery({
    queryKey: ['assignments', className],
    queryFn: () => fetchAssignments(className),
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};

export const useSubmissions = (assignmentId: string) => {
  return useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => fetchSubmissions(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useStudentSubmission = (assignmentId: string, studentId: string) => {
  return useQuery({
    queryKey: ['submission', assignmentId, studentId],
    queryFn: () => fetchStudentSubmission(assignmentId, studentId),
    enabled: !!assignmentId && !!studentId,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission'] });
    },
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gradeSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};
