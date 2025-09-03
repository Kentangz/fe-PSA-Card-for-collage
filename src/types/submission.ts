import type { Batch } from "./batch.types";
import type { Card } from "./card.types";
import type { User } from "./user.types";

export type CardType = Card;

// New BatchPayment related types
export type UserType = User;

export interface BatchPaymentType {
	id: number;
	batch_id: number;
	user_id: number;
	payment_url: string | null;
	is_sent: boolean;
	sent_at: string | null;
	total_submissions: number;
	created_at: string;
	updated_at: string;
	user: UserType;
	batch: Batch;
	submissions_detail: CardType[];
}

export interface BatchPaymentsResponse {
	batch: {
		id: number;
		batch_number: string;
	};
	payments: BatchPaymentType[];
}

export interface UserPaymentGroup {
	user: UserType;
	submissions: CardType[];
	paymentInfo: BatchPaymentType | null;
}

// Existing types
export interface CardsResponse {
	data: CardType[];
}

export interface ApiResponse {
	cards?: CardType[];
	data?: CardType[] | CardsResponse;
}

export interface FilterOptions {
	searchTerm: string;
	sortBy: string;
	sortOrder: "asc" | "desc";
}

export interface SubmissionStats {
	total: number;
	pending: number;
	processing: number;
	completed: number;
	rejected: number;
}
