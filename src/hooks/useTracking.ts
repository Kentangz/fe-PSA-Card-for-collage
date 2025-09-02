import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axiosInstance";
import { getUserCards } from "@/services/cardService";
import type { Card } from "@/types/card.types";
import type { CurrentUser } from "@/types/user.types";
import { isAxiosError } from "@/utils/errorUtils";
// import type { AxiosError } from "../types/error.types";

export const useTracking = () => {
	const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(
		undefined
	);
	const [cards, setCards] = useState<Card[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const initializeTracking = async () => {
			try {
				setLoading(true);
				setError(null);

				const [userResponse, cardsData] = await Promise.all([
					axiosInstance.get<CurrentUser>("/user"),
					getUserCards(),
				]);

				const user = userResponse.data;

				if (!user.is_active || user.role !== "user") {
					Cookies.remove("token");
					Cookies.remove("role");
					navigate("/signin", { replace: true });
					return;
				}

				setCurrentUser(user);
				const sortedCards = [...cardsData].sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
				setCards(sortedCards);
			} catch (err: unknown) {
				console.error("Tracking Page error:", err);

				if (isAxiosError(err)) {
					if (err.response?.status === 401 || err.response?.status === 403) {
						Cookies.remove("token");
						Cookies.remove("role");
						navigate("/signin", { replace: true });
					} else {
						setError(
							err.response?.data?.message || "Failed to load tracking data."
						);
					}
				} else {
					setError("An unexpected error occurred.");
				}
			} finally {
				setLoading(false);
			}
		};

		initializeTracking();
	}, [navigate]);

	return { currentUser, cards, loading, error };
};
