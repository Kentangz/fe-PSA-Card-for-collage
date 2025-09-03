import axiosInstance from "../lib/axiosInstance";
import type { CardType } from "../types/submission";

export interface UserQueueItem {
	queue_order: number;
	user: {
		id: number;
		name: string;
		email: string;
	};
	submissions: CardType[];
	submission_count: number;
}

export interface BatchQueueResponse {
	success: boolean;
	data: {
		batch: {
			id: number;
			batch_number: string;
			register_number: string;
			category: string;
			is_active: boolean;
		};
		user_queues: UserQueueItem[];
	};
}

export const queueService = {
	/**
	 * Get user queue for a specific batch
	 */
	async getBatchUserQueue(batchId: number): Promise<BatchQueueResponse> {
		try {
			const response = await axiosInstance.get<BatchQueueResponse>(
				`/batches/${batchId}/user-queue`
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch batch user queue:", error);
			throw error;
		}
	},

	/**
	 * Update user queue order for a batch
	 */
	async updateBatchUserQueue(
		batchId: number,
		userIds: number[]
	): Promise<BatchQueueResponse> {
		try {
			const response = await axiosInstance.put<BatchQueueResponse>(
				`/batches/${batchId}/user-queue`,
				{
					user_ids: userIds,
				}
			);
			return response.data;
		} catch (error) {
			console.error("Failed to update batch user queue:", error);
			throw error;
		}
	},
};
