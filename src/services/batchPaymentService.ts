import axiosInstance from "../lib/axiosInstance";
import type {
	BatchPaymentType,
	BatchPaymentsResponse,
} from "../types/submission";

export interface CreateBatchPaymentData {
	batch_id: number;
	user_id: number;
	payment_url: string;
	submission_ids?: number[];
}

export interface UpdateBatchPaymentData {
	payment_url?: string;
}

export const batchPaymentService = {
	getByBatch: async (batchId: number): Promise<BatchPaymentsResponse> => {
		const response = await axiosInstance.get<BatchPaymentsResponse>(
			`/batch-payments/batch/${batchId}`
		);
		return response.data;
	},

	getBatchPayment: async (id: number): Promise<{ data: BatchPaymentType }> => {
		const response = await axiosInstance.get<{ data: BatchPaymentType }>(
			`/batch-payments/${id}`
		);
		return response.data;
	},

	createOrUpdate: async (
		data: CreateBatchPaymentData
	): Promise<{ message: string; data: BatchPaymentType }> => {
		const response = await axiosInstance.post<{
			message: string;
			data: BatchPaymentType;
		}>("/batch-payments", data);
		return response.data;
	},

	sendPaymentLink: async (
		id: number
	): Promise<{ message: string; data: BatchPaymentType }> => {
		const response = await axiosInstance.put<{
			message: string;
			data: BatchPaymentType;
		}>(`/batch-payments/${id}/send`);
		return response.data;
	},

	deleteBatchPayment: async (id: number): Promise<{ message: string }> => {
		const response = await axiosInstance.delete<{ message: string }>(
			`/batch-payments/${id}`
		);
		return response.data;
	},

	getPendingPayments: async (): Promise<{ data: BatchPaymentType[] }> => {
		const response = await axiosInstance.get<{ data: BatchPaymentType[] }>(
			"/batch-payments-pending"
		);
		return response.data;
	},
};
