import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import Cookies from "js-cookie";
import type { Card } from "../types/card.types";
import type { Batch } from "../types/batch.types";
import type { CurrentUser } from "../types/user.types";

interface AxiosError {
	isAxiosError: true;
	response?: {
		status?: number;
		data?: {
			message?: string;
		};
	};
}

function isAxiosError(error: unknown): error is AxiosError {
	return (
		typeof error === "object" &&
		error !== null &&
		"isAxiosError" in error &&
		(error as { isAxiosError?: boolean }).isAxiosError === true
	);
}

export const useUserDashboard = () => {
	const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(
		undefined
	);
	const [cards, setCards] = useState<Card[] | undefined>(undefined);
	const [activeBatches, setActiveBatches] = useState<Batch[] | undefined>(
		undefined
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const hasInitialized = useRef(false);

	useEffect(() => {
		if (hasInitialized.current) return;
		hasInitialized.current = true;

		const initializeDashboard = async () => {
			try {
				setLoading(true);
				setError(null);

				const [userResponse, cardsResponse, batchesResponse] =
					await Promise.all([
						axiosInstance.get<CurrentUser>("/user"),
						axiosInstance
							.get<Card[]>("/user-cards")
							.catch(() => ({ data: [] })),
						axiosInstance
							.get<Batch[]>("/active-batches")
							.catch(() => ({ data: [] })),
					]);

				const user = userResponse.data;

				if (!user.is_active) {
					Cookies.remove("token");
					Cookies.remove("role");
					navigate("/signin", { replace: true });
					return;
				}
				if (user.role === "admin") {
					navigate("/dashboard/admin", { replace: true });
					return;
				}

				setCurrentUser(user);
				setCards(cardsResponse.data);
				setActiveBatches(batchesResponse.data);
			} catch (err: unknown) {
				console.error("Dashboard error:", err);
				if (isAxiosError(err)) {
					if (err.response?.status === 401 || err.response?.status === 403) {
						Cookies.remove("token");
						Cookies.remove("role");
						navigate("/signin", { replace: true });
					} else {
						setError(
							err.response?.data?.message || "Gagal memuat data dashboard."
						);
					}
				} else {
					setError("Terjadi kesalahan yang tidak terduga.");
				}
			} finally {
				setLoading(false);
			}
		};

		initializeDashboard();
	}, [navigate]);

	return { currentUser, cards, activeBatches, loading, error };
};
