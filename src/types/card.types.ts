import type { Batch } from "./batch.types";
import type { User } from "./user.types";

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
	user: User;
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

export interface CardImage {
	id: number;
	card_id: string;
	path: string;
	created_at: string;
	updated_at: string;
}

export interface CardDetail extends Card {
	statuses: CardStatus[];
	images: CardImage[];
}
