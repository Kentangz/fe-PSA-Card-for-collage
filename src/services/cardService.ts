import axiosInstance from "../lib/axiosInstance";

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
