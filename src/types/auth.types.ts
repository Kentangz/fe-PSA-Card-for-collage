export interface LoginResponse {
	token: string;
	user: {
		role: "admin" | "user";
	};
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	name: string;
	email: string;
	phone_number: string;
	password: string;
	password_confirmation: string;
}

export interface ForgotPasswordCredentials {
	email: string;
}

export interface ResetPasswordCredentials {
	token: string;
	email: string;
	password: string;
	password_confirmation: string;
}
