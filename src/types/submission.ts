export interface CardType {
	id: string;
	user_id: number;
	batch_id?: number;
	name: string;
	year: number;
	brand: string;
	serial_number: string;
	grade_target: string;
	grade: string;
	payment_url?: string;
	batch?: BatchType;
	latest_status: {
		status: string;
	};
	created_at: string;
	updated_at: string;
}

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

// New BatchPayment related types
export interface UserType {
	id: number;
	name: string;
	email: string;
	role: string;
	is_active: boolean;
}

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
	batch: BatchType;
	submissions_detail: CardType[];
}

export interface BatchPaymentsResponse {
	batch: BatchType;
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
