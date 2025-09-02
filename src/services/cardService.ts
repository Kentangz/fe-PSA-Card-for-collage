import axiosInstance from "@/lib/axiosInstance";
import type { Card } from "@/types/card.types";

export type DeliveryProof = {
	id: number;
	card_id: string;
	image_path: string;
	created_at: string;
	updated_at: string;
};

export type DeliveryProofResponse = {
	card_id: string;
	card_name: string;
	delivery_proofs: DeliveryProof[];
};

export type UploadResponse = {
	success: boolean;
	message: string;
	data: {
		id: number;
		card_id: string;
		image_path: string;
		image_url: string;
		created_at: string;
	};
};

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

export const getDeliveryProofs = async (
	cardId: string | number
): Promise<DeliveryProof[]> => {
	const res = await axiosInstance.get<DeliveryProofResponse>(
		`/card/${cardId}/delivery-proof`
	);
	return res.data.delivery_proofs || [];
};

export const uploadDeliveryProof = async (
	cardId: string | number,
	file: File
): Promise<DeliveryProof> => {
	const formData = new FormData();
	formData.append("image", file);
	const res = await axiosInstance.post<UploadResponse>(
		`/card/${cardId}/delivery-proof`,
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
		}
	);
	const data = res.data.data;
	return {
		id: data.id,
		card_id: data.card_id,
		image_path: data.image_path,
		created_at: data.created_at,
		updated_at: data.created_at,
	};
};

export const deleteDeliveryProof = async (
	cardId: string | number,
	proofId: number
): Promise<void> => {
	await axiosInstance.delete(`/card/${cardId}/delivery-proof/${proofId}`);
};

export const updateCardStatus = async (
	cardId: string | number,
	status: string
): Promise<void> => {
	await axiosInstance.post(`/status`, { card_id: cardId, status });
};
