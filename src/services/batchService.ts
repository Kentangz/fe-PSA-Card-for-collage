import axiosInstance from "../lib/axiosInstance";

export interface BatchType {
	id: number;
	batch_number: string;
	register_number: string;
	services: string;
	category: "PSA-Japan" | "PSA-USA" | "CGC";
	is_active: boolean;
	cards_count?: number;
	created_at: string;
	updated_at: string;
}

export interface CreateBatchData {
	services: string;
	category: "PSA-Japan" | "PSA-USA" | "CGC";
	is_active?: boolean;
}

export interface UpdateBatchData {
	services?: string;
	category?: "PSA-Japan" | "PSA-USA" | "CGC";
	is_active?: boolean;
}

export const batchService = {
	// Get all batches (admin)
	getAllBatches: async (
		status?: "active" | "inactive"
	): Promise<BatchType[]> => {
		const params = status ? { status } : {};
		const response = await axiosInstance.get<BatchType[]>("/batches", {
			params,
		});
		return response.data;
	},

	// Get active batches (user)
	getActiveBatches: async (): Promise<BatchType[]> => {
		const response = await axiosInstance.get<BatchType[]>("/active-batches");
		return response.data;
	},

	// Get specific batch with submissions (admin)
	getBatch: async (id: number): Promise<BatchType> => {
		const response = await axiosInstance.get<BatchType>(`/batches/${id}`);
		return response.data;
	},

	// Create new batch (admin)
	createBatch: async (
		data: CreateBatchData
	): Promise<{ message: string; batch: BatchType }> => {
		const response = await axiosInstance.post<{
			message: string;
			batch: BatchType;
		}>("/batches", data);
		return response.data;
	},

	// Update batch (admin)
	updateBatch: async (
		id: number,
		data: UpdateBatchData
	): Promise<{ message: string; batch: BatchType }> => {
		const response = await axiosInstance.put<{
			message: string;
			batch: BatchType;
		}>(`/batches/${id}`, data);
		return response.data;
	},
};
