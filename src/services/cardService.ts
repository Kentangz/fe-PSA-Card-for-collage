import axiosInstance from "../lib/axiosInstance";
import type { Card } from "../types/card.types";

export const createCard = async (formData: FormData): Promise<void> => {
	try {
		await axiosInstance.post("/card", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	} catch (error) {
		console.error("Failed to create card:", error);
		throw new Error(
			"An error occurred while submitting a card. Please try again."
		);
	}
};

export const getUserCards = async (): Promise<Card[]> => {
	try {
		const response = await axiosInstance.get<Card[]>("/user-cards");
		return response.data;
	} catch (error) {
		console.error("Failed to fetch user cards:", error);
		throw new Error("An error occurred while fetching submission data.");
	}
};
