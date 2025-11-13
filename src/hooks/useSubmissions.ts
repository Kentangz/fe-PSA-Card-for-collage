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
	error?:{
		name?: string;
		year?: string;
		brand?: string;
		images?: string;
	}
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
			error: {
				name: "",
				year: "",
				brand: "",
				images: "",
			}
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
				error: {
					name: "",
					year: "",
					brand: "",
					images: "",
				}
			},
		]);
	}, []);

const validateField = (
	name: keyof SubmissionFormData,
	value: string | File[]
) => {
	switch (name) {
		case "name":
		case "brand": {
			const strValue = (value as string).trim();
			if (strValue.length === 0) {
				return "This field is required.";
			}
			if (strValue.length < 5) {
				return "Must be at least 5 characters.";
			}
			if (strValue.length > 30) {
				return "Must be 30 characters or less.";
			}
			return undefined;
		}
		case "year":
			if (!(value as string) || (value as string).trim().length === 0) {
				return "Year is required.";
			}
			return undefined;
		case "images":
			if (!value || (value as File[]).length === 0) {
				return "At least one image is required.";
			}
			return undefined;
		default:
			return undefined;
	}
};

	const removeSubmission = useCallback(
		(index: number) => {
			if (submissions.length > 1) {
				setSubmissions((prev) => prev.filter((_, i) => i !== index));
			}
		},
		[submissions.length]
	);

const updateForm = useCallback(
	(index: number, field: keyof SubmissionFormData, value: string | File[]) => {
		const newSubmissions = [...submissions];
		const updatedSubmission = {
			...newSubmissions[index],
			[field]: value,
		};

		// Validasi field yang berubah
		const error = validateField(field, value);

		updatedSubmission.error = {
			...updatedSubmission.error,
			[field]: error,
		};

		newSubmissions[index] = updatedSubmission;
		setSubmissions(newSubmissions);
	},
	[submissions]
);

const validateAllForms = () => {
	let isValid = true;
	const newSubmissionsState = submissions.map((sub) => {
		const errors: SubmissionFormData["error"] = {};

		const nameError = validateField("name", sub.name);
		if (nameError) {
			errors.name = nameError;
			isValid = false;
		}

		const brandError = validateField("brand", sub.brand);
		if (brandError) {
			errors.brand = brandError;
			isValid = false;
		}

		const yearError = validateField("year", sub.year);
		if (yearError) {
			errors.year = yearError;
			isValid = false;
		}

		const imagesError = validateField("images", sub.images);
		if (imagesError) {
			errors.images = imagesError;
			isValid = false;
		}

		return { ...sub, errors };
	});

	setSubmissions(newSubmissionsState);
	return isValid;
};

	const handleSubmitAll = async () => {
		const isValid = validateAllForms();
		if (!batchId || !isValid) {
			setError("Please fix the errors below and make sure at least one image is uploaded before submitting.");
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
