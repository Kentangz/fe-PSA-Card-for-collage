export interface CardType {
	id: string | number;
	name: string;
	year: string | number;
	brand: string;
	serial_number: string;
	grade_target: string;
	created_at: string;
	latest_status: {
		status: string;
	};
}

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

export type UserType = {
	name: string;
	email: string;
	role: string;
};

export interface SubmissionStats {
	total: number;
	pending: number;
	processing: number;
	completed: number;
	rejected: number;
}
