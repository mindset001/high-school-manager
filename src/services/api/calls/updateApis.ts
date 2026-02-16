import apiClient from "../apiClient";

export const updateStudent = async ({
  id,
  updateData,
}: {
  id: number;
  updateData: object;
}) => {
  const response = await apiClient.patch(`students/${id}/`, updateData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const editStaff = ({ id, updateData }: { id: number; updateData: object }) => {
  return apiClient.patch(`/staff/${id}/`, updateData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteStaff = (id: number) => {
  return apiClient.delete(`/staff/${id}/`);
};