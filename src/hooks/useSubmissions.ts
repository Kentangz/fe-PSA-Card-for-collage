import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import type { Batch } from "../types/batch.types";
import type { CurrentUser } from "../types/user.types";
import { createCard } from "../services/cardService";

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
				const [userResponse, batchResponse] = await Promise.all([
					axiosInstance.get<CurrentUser>("/user"),
					axiosInstance.get<Batch>(`/batches/${batchId}`),
				]);

				if (
					!userResponse.data.is_active ||
					userResponse.data.role === "admin" ||
					!batchResponse.data.is_active
				) {
					navigate("/dashboard/user", { replace: true });
					return;
				}

				setCurrentUser(userResponse.data);
				setSelectedBatch(batchResponse.data);
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
			for (const submission of submissions) {
				const formData = new FormData();
				formData.append("name", submission.name);
				formData.append("year", submission.year);
				formData.append("brand", submission.brand);
				// formData.append("grade_target", submission.grade_target);
				formData.append("batch_id", batchId);
				submission.images.forEach((file) => formData.append("images[]", file));

				await createCard(formData);
			}
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
