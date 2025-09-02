import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import type { Card } from "@/types/card.types";
import type { Batch } from "@/types/batch.types";
import type { CurrentUser } from "@/types/user.types";
import { isAxiosError } from "@/utils/errorUtils";
import { userService } from "@/services/userService";
import { getUserCards } from "@/services/cardService";
import { batchService } from "@/services/batchService";

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

				const [user, cardsData, batchesData] = await Promise.all<
					[Promise<CurrentUser>, Promise<Card[]>, Promise<Batch[]>]
				>([
					userService.getCurrentUser(),
					getUserCards().catch(() => Promise.resolve([] as Card[])),
					batchService
						.getActiveBatches()
						.catch(() => Promise.resolve([] as Batch[])),
				]);

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
				setCards(cardsData);
				setActiveBatches(batchesData);
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
