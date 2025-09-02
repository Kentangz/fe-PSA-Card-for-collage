import { useCallback, useEffect, useRef, useState } from "react";
import {
	deleteDeliveryProof as apiDelete,
	getDeliveryProofs as apiList,
	uploadDeliveryProof as apiUpload,
} from "@/services/cardService";
import type { DeliveryProof } from "@/services/cardService";

export const useDeliveryProofs = (cardId: string | number | undefined) => {
	const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
	const [uploading, setUploading] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const prevProofsRef = useRef<DeliveryProof[]>([]);

	const fetchProofs = useCallback(async () => {
		if (!cardId) return;
		try {
			const proofs = await apiList(cardId);
			setDeliveryProofs(proofs);
		} catch {
			setDeliveryProofs([]);
		}
	}, [cardId]);

	useEffect(() => {
		prevProofsRef.current = deliveryProofs;
	}, [deliveryProofs]);

	const uploadFiles = useCallback(
		async (files: File[]) => {
			if (!cardId || files.length === 0) return [] as DeliveryProof[];
			setUploading(true);
			try {
				const uploaded = await Promise.all(
					files.map((f) => apiUpload(cardId, f))
				);
				const updated = [...deliveryProofs, ...uploaded];
				setDeliveryProofs(updated);
				await fetchProofs();
				return uploaded;
			} finally {
				setUploading(false);
			}
		},
		[cardId, deliveryProofs, fetchProofs]
	);

	const deleteProof = useCallback(
		async (proofId: number) => {
			if (!cardId) return;
			setDeletingId(proofId);
			try {
				await apiDelete(cardId, proofId);
				const updated = deliveryProofs.filter((p) => p.id !== proofId);
				setDeliveryProofs(updated);
				await fetchProofs();
			} finally {
				setDeletingId(null);
			}
		},
		[cardId, deliveryProofs, fetchProofs]
	);

	return {
		deliveryProofs,
		fetchProofs,
		uploadFiles,
		deleteProof,
		uploading,
		deletingId,
	};
};
