import { useCallback } from "react";
import { updateCardStatus } from "@/services/cardService";

export const useStatusActions = (cardId: string | number | undefined) => {
	const handleUpdateSubmission = useCallback(
		async (status: string) => {
			if (!cardId) return;
			await updateCardStatus(cardId, status);
			// Consumers can re-fetch via their own hooks instead of global events
		},
		[cardId]
	);

	return { handleUpdateSubmission };
};
