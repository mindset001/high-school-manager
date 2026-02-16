import apiClient from "../apiClient";

export const deleteData = async ({id, studentid} : {id: number, studentid: number}) => {
    const response = await apiClient.delete(`classes/${id}/student/${studentid}`);
    return response.data;
  };

export const deleteEvent = async (id:number) => {
    const response = await apiClient.delete(
      `/calender/${id}/`
    );
    return response.data;
  };
