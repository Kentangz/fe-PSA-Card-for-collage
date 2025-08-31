import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../lib/api";

interface LoginCredentials {
	email: string;
	password: string;
}

interface LoginResponse {
	token: string;
	user: {
		role: string;
	};
}

interface RegisterCredentials {
	name: string;
	email: string;
	phone_number: string;
	password: string;
	password_confirmation: string;
}

interface ForgotPasswordCredentials {
  email: string;
}

interface ResetPasswordCredentials {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const COOKIE_EXPIRE_DAYS = 1;

export const login = async (
	credentials: LoginCredentials
): Promise<LoginResponse> => {
	try {
		const response = await axios.post<LoginResponse>(
			`${API_URL}/login`,
			credentials
		);
		const data = response.data;

		if (data?.token) {
			Cookies.set("token", data.token, { expires: COOKIE_EXPIRE_DAYS });
			Cookies.set("role", data.user.role, { expires: COOKIE_EXPIRE_DAYS });
		}

		return data;
	} catch (err: unknown) {
		const error = err as { response?: { data?: { message?: string } } };
		const errorMessage =
			error?.response?.data?.message || "An unexpected error occurred.";
		throw new Error(errorMessage);
	}
};

export const register = async (
	credentials: RegisterCredentials
): Promise<void> => {
	try {
		await axios.post(`${API_URL}/register`, credentials);
	} catch (err: unknown) {
		const error = err as {
			response?: {
				data?: { errors?: Record<string, string[]>; message?: string };
			};
		};
		if (error?.response?.data?.errors) {
			const validationErrors = Object.values(error.response.data.errors)
				.flat()
				.join(", ");
			throw new Error(validationErrors);
		}
		const errorMessage =
			error?.response?.data?.message || "Registration failed.";
		throw new Error(errorMessage);
	}
};

export const forgotPassword = async (
	credentials: ForgotPasswordCredentials
): Promise<{ status: string }> => {
	try {
		const response = await axios.post<{ status: string }>(
			`${API_URL}/forgot-password`,
			credentials
		);
		return response.data;
	} catch (err: unknown) {
		const error = err as { response?: { data?: { message?: string } } };
		const errorMessage =
			error?.response?.data?.message || "Failed to send reset link.";
		throw new Error(errorMessage);
	}
};

export const resetPassword = async (
	credentials: ResetPasswordCredentials
): Promise<void> => {
	try {
		await axios.post(`${API_URL}/reset-password`, credentials);
	} catch (err: unknown) {
		const error = err as {
			response?: {
				data?: { message?: string; errors?: Record<string, string[]> };
			};
		};
		if (error?.response?.data?.errors) {
			const validationErrors = Object.values(error.response.data.errors)
				.flat()
				.join("\n");
			throw new Error(validationErrors);
		}
		const errorMessage =
			error?.response?.data?.message || "Failed to reset password.";
		throw new Error(errorMessage);
	}
};
