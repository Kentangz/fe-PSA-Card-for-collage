import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";

type CardStatus = {
	status: string;
	created_at: string;
};

type CardImage = {
	path: string;
};

type Batch = {
	id: string | number;
	batch_number: string;
	register_number: string;
	services: string;
	category: string;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
};

export type AdminCard = {
	id: string | number;
	user_id: number;
	name: string;
	year: string;
	brand: string;
	serial_number: string;
	grade: string | null;
	payment_url?: string | null;
	created_at: string;
	images: CardImage[];
	statuses: CardStatus[];
	latest_status: CardStatus;
	batch?: Batch;
};

type CardResponse = { data: AdminCard };
type ApiResponse = { card?: AdminCard; data?: AdminCard | CardResponse };

type CurrentUser = { name: string; email: string; role: string };

export const useAdminSubmissionDetail = (cardId: string | undefined) => {
	const navigate = useNavigate();
	const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(
		undefined
	);
	const [card, setCard] = useState<AdminCard | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const parseCardResponse = (
		payload: ApiResponse | AdminCard | CardResponse
	) => {
		if (payload && typeof payload === "object") {
			const data = payload as ApiResponse;
			if (data.data && typeof data.data === "object") {
				if ("data" in data.data) {
					return (data.data as CardResponse).data;
				}
				return data.data as AdminCard;
			}
			if (data.card) return data.card;
			if (
				"name" in (payload as AdminCard) &&
				"brand" in (payload as AdminCard)
			) {
				return payload as AdminCard;
			}
		}
		return null;
	};

	const refresh = useCallback(async () => {
		if (!cardId) return;
		try {
			const response = await axiosInstance.get<
				ApiResponse | AdminCard | CardResponse
			>(`/card/${cardId}`);
			const parsed = parseCardResponse(response.data);
			if (parsed) {
				setCard((prev) => {
					if (!prev) return parsed;
					// Shallow compare to prevent unnecessary re-renders
					const same =
						prev.id === parsed.id &&
						prev.latest_status.status === parsed.latest_status.status &&
						prev.grade === parsed.grade &&
						prev.serial_number === parsed.serial_number &&
						prev.payment_url === parsed.payment_url &&
						prev.statuses.length === parsed.statuses.length;
					return same ? prev : parsed;
				});
			}
		} catch (err) {
			console.error(err);
		}
	}, [cardId]);

	const applyLocalUpdate = useCallback(
		(
			nextStatus: string,
			extra?: {
				grade?: string | null | unknown;
				serial_number?: string | unknown;
			}
		) => {
			setCard((prev) => {
				if (!prev) return prev;
				const now = new Date().toISOString();
				const nextSerial =
					typeof extra?.serial_number !== "undefined" &&
					extra?.serial_number !== null
						? String(extra?.serial_number)
						: prev.serial_number;
				return {
					...prev,
					latest_status: { status: nextStatus, created_at: now },
					statuses: [...prev.statuses, { status: nextStatus, created_at: now }],
					grade:
						typeof extra?.grade !== "undefined"
							? (extra?.grade as string | null)
							: prev.grade,
					serial_number: nextSerial,
				};
			});
		},
		[]
	);

	useEffect(() => {
		const init = async () => {
			try {
				setLoading(true);
				setError(null);
				const token = Cookies.get("token");
				const role = Cookies.get("role");
				if (!token || role !== "admin") {
					navigate("/signin", { replace: true });
					return;
				}
				const response = await axiosInstance.get<CurrentUser>("/user");
				setCurrentUser(response.data);
			} catch (e) {
				console.error(e);
				Cookies.remove("token");
				Cookies.remove("role");
				navigate("/signin", { replace: true });
				return;
			} finally {
				setLoading(false);
			}
		};

		init();
	}, [navigate]);

	useEffect(() => {
		const fetchCard = async () => {
			if (!cardId || !currentUser) return;
			try {
				const shouldSetLoading = !card;
				if (shouldSetLoading) setLoading(true);
				setError(null);
				await refresh();
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load submission details"
				);
			} finally {
				if (!card) setLoading(false);
			}
		};
		fetchCard();
		const interval = setInterval(fetchCard, 10000);
		return () => clearInterval(interval);
	}, [cardId, currentUser, refresh, card]);

	return {
		currentUser,
		card,
		loading,
		error,
		setCard,
		refresh,
		applyLocalUpdate,
	} as const;
};
