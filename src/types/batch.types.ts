export interface Batch {
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
