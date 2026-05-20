import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./apiClient";

export interface IAttendanceRecord {
  student: string | any; // Can be string ID or populated object
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export interface IStaffAttendanceRecord {
  staff: string | any;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  remarks?: string;
}

export const fetchAttendance = async (className: string, date: string) => {
  if (!className || !date) return null;
  const response = await apiClient.get(`/attendance/${encodeURIComponent(className)}/${date}`);
  return response.data;
};

export const saveAttendance = async ({ className, date, records }: { className: string; date: string; records: IAttendanceRecord[] }) => {
  const response = await apiClient.post(`/attendance/${encodeURIComponent(className)}/${date}`, { records });
  return response.data;
};

export const fetchStudentAttendance = async (studentId: string) => {
  if (!studentId) return null;
  const response = await apiClient.get(`/attendance/student/${studentId}`);
  return response.data;
};

export const fetchStaffAttendance = async (date: string) => {
  if (!date) return null;
  const response = await apiClient.get(`/attendance/staff/${date}`);
  return response.data;
};

export const saveStaffAttendance = async ({ date, records }: { date: string; records: IStaffAttendanceRecord[] }) => {
  const response = await apiClient.post(`/attendance/staff/${date}`, { records });
  return response.data;
};

export const fetchClassAttendanceReport = async (className: string, startDate: string, endDate: string) => {
  if (!className || !startDate || !endDate) return null;
  const response = await apiClient.get(`/attendance/report/class/${encodeURIComponent(className)}?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const fetchStaffAttendanceReport = async (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return null;
  const response = await apiClient.get(`/attendance/report/staff?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// React Query Hooks

export const useAttendance = (className: string, date: string) => {
  return useQuery({
    queryKey: ['attendance', className, date],
    queryFn: () => fetchAttendance(className, date),
    enabled: !!className && !!date,
  });
};

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.className, variables.date] });
    },
  });
};

export const useStudentAttendance = (studentId: string) => {
  return useQuery({
    queryKey: ['attendance', 'student', studentId],
    queryFn: () => fetchStudentAttendance(studentId),
    enabled: !!studentId,
  });
};

export const useStaffAttendance = (date: string) => {
  return useQuery({
    queryKey: ['attendance', 'staff', date],
    queryFn: () => fetchStaffAttendance(date),
    enabled: !!date,
  });
};

export const useSaveStaffAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStaffAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'staff', variables.date] });
    },
  });
};

export const useClassAttendanceReport = (className: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['attendance', 'report', 'class', className, startDate, endDate],
    queryFn: () => fetchClassAttendanceReport(className, startDate, endDate),
    enabled: !!className && !!startDate && !!endDate,
  });
};

export const useStaffAttendanceReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['attendance', 'report', 'staff', startDate, endDate],
    queryFn: () => fetchStaffAttendanceReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};
