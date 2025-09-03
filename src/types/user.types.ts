export interface User {
	id: number;
	name: string;
	email: string;
	phone_number: string;
	role: "admin" | "user";
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface CurrentUser {
	name: string;
	email: string;
	role: "admin" | "user";
	is_active: boolean;
}
