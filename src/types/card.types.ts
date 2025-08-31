import type { Batch } from "./batch.types";

export interface CardStatus {
	id: number;
	card_id: string;
	status: string;
	created_at: string;
	updated_at: string;
}

export interface Card {
	id: string;
	user_id: number;
	name: string;
	year: number;
	brand: string;
	serial_number: string;
	latest_status: CardStatus;
	grade_target: string;
	grade: string | null;
	created_at: string;
	updated_at: string;
	batch_id?: number;
	batch?: Batch;
}
