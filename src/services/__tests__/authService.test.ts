import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as authService from "../authService";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";

vi.mock("@/lib/axiosInstance");
vi.mock("js-cookie");

describe("AuthService - Complete Coverage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("login()", () => {
		it("harus login berhasil dan menyimpan token & role ke cookies", async () => {
			const mockCredentials = {
				email: "test@example.com",
				password: "password123",
			};
			const mockResponse = {
				data: {
					token: "fake-jwt-token",
					user: { name: "Test User", role: "user" },
				},
			};

			vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

			const result = await authService.login(mockCredentials);

			expect(axiosInstance.post).toHaveBeenCalledWith(
				"/login",
				mockCredentials
			);
			expect(result).toEqual(mockResponse.data);
			expect(Cookies.set).toHaveBeenCalledWith("token", "fake-jwt-token", {
				expires: 1,
			});
			expect(Cookies.set).toHaveBeenCalledWith("role", "user", {
				expires: 1,
			});
		});

		it("harus throw error dengan message dari server saat login gagal", async () => {
			const mockCredentials = {
				email: "wrong@example.com",
				password: "wrongpass",
			};

			vi.mocked(axiosInstance.post).mockRejectedValue({
				response: {
					data: {
						message: "Invalid credentials",
					},
				},
			});

			await expect(authService.login(mockCredentials)).rejects.toThrow(
				"Invalid credentials"
			);
		});

		it("harus throw error default saat tidak ada message dari server", async () => {
			const mockCredentials = {
				email: "test@example.com",
				password: "password123",
			};

			vi.mocked(axiosInstance.post).mockRejectedValue({
				response: {},
			});

			await expect(authService.login(mockCredentials)).rejects.toThrow(
				"An unexpected error occurred."
			);
		});
	});

	describe("register()", () => {
		it("harus register berhasil dengan data yang valid", async () => {
			const mockRegisterData = {
				name: "Budi Santoso",
				email: "newuser@example.com",
				phone_number: "081234567890",
				password: "password123",
				password_confirmation: "password123",
			};

			vi.mocked(axiosInstance.post).mockResolvedValue({
				data: { message: "User registered successfully" },
			});

			await expect(
				authService.register(mockRegisterData)
			).resolves.toBeUndefined();

			expect(axiosInstance.post).toHaveBeenCalledWith(
				"/register",
				mockRegisterData
			);
		});

		it("harus throw validation errors saat data tidak valid", async () => {
			const mockRegisterData = {
				name: "Test",
				email: "invalid-email",
				phone_number: "123",
				password: "123",
				password_confirmation: "456",
			};

			vi.mocked(axiosInstance.post).mockRejectedValue({
				response: {
					data: {
						errors: {
							email: ["The email must be a valid email address."],
							password: [
								"The password must be at least 8 characters.",
								"The password confirmation does not match.",
							],
						},
					},
				},
			});

			await expect(authService.register(mockRegisterData)).rejects.toThrow(
				"The email must be a valid email address., The password must be at least 8 characters., The password confirmation does not match."
			);
		});

		it("harus throw error message dari server saat registrasi gagal", async () => {
			const mockRegisterData = {
				name: "Test",
				email: "test@example.com",
				phone_number: "081234567890",
				password: "password123",
				password_confirmation: "password123",
			};

			vi.mocked(axiosInstance.post).mockRejectedValue({
				response: {
					data: {
						message: "Email already exists",
					},
				},
			});

			await expect(authService.register(mockRegisterData)).rejects.toThrow(
				"Email already exists"
			);
		});

		it("harus throw default error saat tidak ada response data", async () => {
			const mockRegisterData = {
				name: "Test",
				email: "test@example.com",
				phone_number: "081234567890",
				password: "password123",
				password_confirmation: "password123",
			};

			vi.mocked(axiosInstance.post).mockRejectedValue({
				response: {},
			});

			await expect(authService.register(mockRegisterData)).rejects.toThrow(
				"Registration failed."
			);
		});
	});
});