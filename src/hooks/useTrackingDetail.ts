import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axiosInstance";
import type { CurrentUser } from "@/types/user.types";
import type { CardDetail } from "@/types/card.types";

export const useTrackingDetail = (cardId: string | undefined) => {
	const navigate = useNavigate();
	const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(
		undefined
	);
	const [card, setCard] = useState<CardDetail | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const initialize = async () => {
			try {
				setLoading(true);
				setError(null);

				const token = Cookies.get("token");
				const role = Cookies.get("role");

				if (!token || role !== "user") {
					navigate("/signin", { replace: true });
					return;
				}

				if (!cardId) {
					navigate("/dashboard/user/tracking", { replace: true });
					return;
				}

				const userResponse = await axiosInstance.get<CurrentUser>("/user");
				if (!userResponse.data.is_active) {
					Cookies.remove("token");
					Cookies.remove("role");
					navigate("/signin", { replace: true });
					return;
				}
				if (userResponse.data.role === "admin") {
					navigate("/dashboard/admin", { replace: true });
					return;
				}
				setCurrentUser(userResponse.data);

				const cardResponse = await axiosInstance.get<CardDetail>(
					`/user-cards/${cardId}`
				);
				setCard(cardResponse.data);
			} catch (err) {
				console.error(err);
				setError("Failed to load card detail.");
				navigate("/dashboard/user/tracking", { replace: true });
			} finally {
				setLoading(false);
			}
		};

		initialize();
	}, [cardId, navigate]);

	return { currentUser, card, loading, error };
};
