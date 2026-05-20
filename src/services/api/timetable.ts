import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./apiClient";

export interface IPeriod {
  _id?: string;
  startTime: string;
  endTime: string;
  subject?: any; // ObjectId or populated object
  teacher?: any; // ObjectId or populated object
  isBreak: boolean;
  label?: string;
}

export interface IDaySchedule {
  _id?: string;
  dayOfWeek: string;
  periods: IPeriod[];
}

export interface ITimetable {
  _id?: string;
  class: string;
  term: string;
  days: IDaySchedule[];
}

export const fetchTimetable = async (className: string, term?: string) => {
  const params = term ? { term } : {};
  const response = await apiClient.get(`/timetable/${encodeURIComponent(className)}`, { params });
  return response.data;
};

export const saveTimetable = async ({ className, data }: { className: string; data: Partial<ITimetable> }) => {
  const response = await apiClient.put(`/timetable/${encodeURIComponent(className)}`, data);
  return response.data;
};

// React Query Hooks

export const useTimetable = (className: string, term?: string) => {
  return useQuery({
    queryKey: ['timetable', className, term],
    queryFn: () => fetchTimetable(className, term),
    enabled: !!className,
  });
};

export const useSaveTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTimetable,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetable', variables.className] });
    },
  });
};
