import axiosInstance from "../lib/axiosInstance";

export interface QueueEntryUser {
	id: number;
	name: string;
	email: string;
}

export interface QueueEntryItem {
	id: number;
	batch_id: number;
	user_id: number;
	user: QueueEntryUser;
	queue_order: number;
	payment_url: string | null;
	is_sent: boolean;
	cards_count: number;
	created_at: string;
}

export interface PaginatedEntries {
	data: QueueEntryItem[];
	current_page: number;
	per_page: number;
	total: number;
	last_page: number;
}

export interface EntryDetail extends Omit<QueueEntryItem, "cards_count"> {
	cards: Array<{
		id: string;
		name: string;
		year: number;
		brand: string;
		serial_number?: string | null;
		latest_status?: { id: number; status: string; created_at: string } | null;
	}>;
}

export const queueEntryService = {
	async listByBatch(
		batchId: number,
		page = 1,
		perPage = 20
	): Promise<PaginatedEntries> {
		const res = await axiosInstance.get<PaginatedEntries>(
			`/batches/${batchId}/entries`,
			{
				params: { page, perPage },
			}
		);
		return res.data;
	},

	async reorder(
		batchId: number,
		entryIds: number[]
	): Promise<{ message: string }> {
		const res = await axiosInstance.patch<{ message: string }>(
			`/batches/${batchId}/entries/order`,
			{
				entry_ids: entryIds,
			}
		);
		return res.data;
	},

	async setAndSendPayment(
		entryId: number,
		paymentUrl: string
	): Promise<{ message: string; entry: QueueEntryItem }> {
		const res = await axiosInstance.post<{
			message: string;
			entry: QueueEntryItem;
		}>(`/entries/${entryId}/payment-set-send`, {
			payment_url: paymentUrl,
		});
		return res.data;
	},

	async getDetail(entryId: number): Promise<EntryDetail> {
		const res = await axiosInstance.get<EntryDetail>(`/entries/${entryId}`);
		return res.data;
	},
};
