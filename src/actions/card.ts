import axiosInstance from "../lib/axiosInstance";

// Ambil semua kartu milik user saat ini
export const getCurrentUserCard = async () => {
  try {
    const { data } = await axiosInstance.get("/user-cards");
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Ambil semua kartu
export const getCards = async () => {
  try {
    const { data } = await axiosInstance.get("/card");
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Ambil detail kartu berdasarkan ID
export const getCardDetail = async (id: string) => {
  try {
    const { data } = await axiosInstance.get(`/card/${id}`);
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Ambil detail kartu milik user berdasarkan ID
export const getCurrentUserCardDetail = async (id: string) => {
  try {
    const { data } = await axiosInstance.get(`/user-cards/${id}`);
    return data;
  } catch (error) {
    console.error(error);
  }
};
