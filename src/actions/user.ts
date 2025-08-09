import axiosInstance from "../lib/axiosInstance";

// Ambil data user yang sedang login
export const getCurrentUser = async () => {
  try {
    const { data } = await axiosInstance.get("/user");
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Ambil semua user
export const getAllUser = async () => {
  try {
    const { data } = await axiosInstance.get("/users");
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Ambil user berdasarkan ID
export const getUserById = async (id: string) => {
  try {
    const { data } = await axiosInstance.get(`/users/${id}`);
    return data;
  } catch (error) {
    console.error(error);
  }
};
