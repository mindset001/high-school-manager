// import apiClient from "./apiClient";

import { getUser } from "../../../utils/authTokens";
import apiClient from "../apiClient";

export const getBaseClass = () => {
  // Returns classes - baseclass endpoint doesn't exist, use classes instead
  return apiClient.get(`classes/`);
};

export const getClass = () => {
  return apiClient.get(`classes/`);
};

export const getSubjects = () => {
  // Placeholder - subjects not yet implemented
  // Return empty array to prevent errors
  return Promise.resolve({ data: { data: [] } });
};

export const getClassStudentsId = (id: number) => {
  return apiClient.get(`classes/${id}/student/`);
};

// Not yet used
// export const getStudentId = (id : number | string) => {
//   return apiClient.get(`classes/${id}/student/3`);
// };

export const getClassStatId = (id: number | null) => {
  return apiClient.get(`class_stat/${id}`);
};
// import apiClient from "./apiClient";

export const getClassStat = () => {
  return apiClient.get(`class_stat`);
};

export const getHomeAnalytic = () => {
  return apiClient.get(`homeanalytic`);
};

export const getStudents = () => {
  return apiClient.get(`guardians/ward`);
};

export const getStudentsId = (id: number) => {
  return apiClient.get(`students/${id}`);
};

export const getGuardianWardId = (id: number) => {
  return apiClient.get(`guardians/ward/${id}`);
};

export const getGuardianWard = () => {
  return apiClient.get(`guardians/wards`);
};


export const getClassStudentResult = ( id : number) => {
  // Placeholder - student results not yet implemented
  return Promise.resolve({ data: { data: [] } });
};

////////////////////////////
//STAFFS SECTION
////////////////////////////
export const getStaffs = () => {
  return apiClient.get(`staff/`);
};

export const getStaff = () => {
  const user = getUser();
  return apiClient.get(`staff/${user.id}`);
};

export const getCalender = () => {
  // Placeholder - calendar not yet implemented
  return Promise.resolve({ data: { data: [] } });
};

export const getAllTimetables = () => {
  // Placeholder - timetables not yet implemented
  return Promise.resolve({ data: { data: [] } });
};
