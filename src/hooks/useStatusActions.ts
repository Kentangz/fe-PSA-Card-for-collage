import { useCallback, useState } from "react";
import { updateCardStatus } from "@/services/cardService";
import toast from "react-hot-toast";

interface ApiError {
	response?: {
		data?: {
			message?: string;
		};
		status?: number;
	};
	message?: string;
}

export const useStatusActions = (cardId: string | number | undefined) => {
	const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
		{}
	);

	const handleUpdateSubmission = useCallback(
		async (status: string) => {
			if (!cardId) return;

			setLoadingStates((prev) => ({ ...prev, [status]: true }));

			try {
				await updateCardStatus(cardId, status);
				window.location.reload();
			} catch (error) {
				console.error("Failed to update status:", error);
				const apiError = error as ApiError;
				const errorMessage =
					apiError?.response?.data?.message ||
					apiError?.message ||
					"Failed to update status. Please try again.";
				toast.error(errorMessage);
				setLoadingStates((prev) => ({ ...prev, [status]: false }));
			}
		},
		[cardId]
	);

	const isLoading = useCallback(
		(status: string) => {
			return loadingStates[status] || false;
		},
		[loadingStates]
	);

	return { handleUpdateSubmission, isLoading };
};
