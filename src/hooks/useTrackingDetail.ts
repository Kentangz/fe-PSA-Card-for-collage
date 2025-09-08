import { useEffect, useState, useCallback } from "react";
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

	const fetchCard = useCallback(async () => {
		try {
			const cardResponse = await axiosInstance.get<CardDetail>(
				`/user-cards/${cardId}`
			);
			setCard(cardResponse.data);
		} catch (err) {
			console.error(err);
		}
	}, [cardId]);

	const applyLocalUpdate = useCallback(
		(
			nextStatus: string,
			extra?: {
				grade?: string | null | unknown;
				serial_number?: string | null | unknown;
			}
		) => {
			setCard((prev) => {
				if (!prev) return prev;
				const now = new Date().toISOString();
				return {
					...prev,
					latest_status: { status: nextStatus, created_at: now },
					statuses: [...prev.statuses, { status: nextStatus, created_at: now }],
					grade:
						typeof extra?.grade !== "undefined"
							? (extra?.grade as string | null)
							: prev.grade,
					serial_number:
						typeof extra?.serial_number !== "undefined"
							? (extra?.serial_number as string | null)
							: prev.serial_number,
				};
			});
		},
		[]
	);

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

				await fetchCard();
			} catch (err) {
				console.error(err);
				setError("Failed to load card detail.");
				navigate("/dashboard/user/tracking", { replace: true });
			} finally {
				setLoading(false);
			}
		};

		initialize();

		// Poll every 10s for real-time-ish updates
		const interval = setInterval(() => {
			fetchCard();
		}, 10000);
		return () => clearInterval(interval);
	}, [cardId, navigate, fetchCard]);

	return {
		currentUser,
		card,
		loading,
		error,
		refresh: fetchCard,
		applyLocalUpdate,
	};
};
