import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Batch } from "@/types/batch.types";
import type { CurrentUser } from "@/types/user.types";
import { createEntry } from "@/services/cardService";
import { userService } from "@/services/userService";
import { batchService } from "@/services/batchService";

export interface SubmissionFormData {
	name: string;
	year: string;
	brand: string;
	// grade_target: string;
	images: File[];
}

export const useSubmissions = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const batchId = searchParams.get("batch_id");

	const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(
		undefined
	);
	const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>(
		undefined
	);

	const [submissions, setSubmissions] = useState<SubmissionFormData[]>([
		{
			name: "",
			year: "",
			brand: "",
			// grade_target: "",
			images: [],
		},
	]);

	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const initializePage = async () => {
			if (!batchId) {
				navigate("/dashboard/user", { replace: true });
				return;
			}
			try {
				const [user, batch] = await Promise.all([
					userService.getCurrentUser(),
					batchService.getBatch(Number(batchId)),
				]);

				if (!user.is_active || user.role === "admin" || !batch.is_active) {
					navigate("/dashboard/user", { replace: true });
					return;
				}

				setCurrentUser(user);
				setSelectedBatch(batch);
			} catch (err) {
				console.error(err);
				navigate("/dashboard/user", { replace: true });
			} finally {
				setLoading(false);
			}
		};
		initializePage();
	}, [batchId, navigate]);

	const addSubmission = useCallback(() => {
		setSubmissions((prev) => [
			...prev,
			{
				name: "",
				year: "",
				brand: "",
				// grade_target: "",
				images: [],
			},
		]);
	}, []);

	const removeSubmission = useCallback(
		(index: number) => {
			if (submissions.length > 1) {
				setSubmissions((prev) => prev.filter((_, i) => i !== index));
			}
		},
		[submissions.length]
	);

	const updateForm = useCallback(
		(index: number, data: SubmissionFormData) => {
			const updated = [...submissions];
			updated[index] = data;
			setSubmissions(updated);
		},
		[submissions]
	);

	const validateSubmissions = () => {
		return submissions.every(
			(sub) =>
				sub.name &&
				sub.year &&
				sub.brand &&
				// sub.grade_target &&
				sub.images.length > 0
		);
	};

	const handleSubmitAll = async () => {
		if (!batchId || !validateSubmissions()) {
			setError(
				"Please make sure all fields are filled and at least one image is uploaded for each submission."
			);
			return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			// Build cards array for entry endpoint (with images)
			const cards = submissions.map((s) => ({
				name: s.name,
				year: s.year,
				brand: s.brand,
				images: s.images,
			}));
			await createEntry(Number(batchId), cards);
			navigate("/dashboard/user");
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unknown error occurred.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		loading,
		isSubmitting,
		error,
		currentUser,
		selectedBatch,
		submissions,
		addSubmission,
		removeSubmission,
		updateForm,
		handleSubmitAll,
		handleBackToDashboard: () => navigate("/dashboard/user"),
	};
};
