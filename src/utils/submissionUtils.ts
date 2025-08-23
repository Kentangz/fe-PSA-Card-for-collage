import type {
	CardType,
	FilterOptions,
	SubmissionStats,
} from "../types/submission";

/**
 * Safe string conversion for null/undefined values
 */
function safeString(value: string | null | undefined): string {
	return (value || "").toString();
}

/**
 * Filter and sort submissions data based on the provided options
 */
export function filterAndSortSubmissions(
	submissions: CardType[],
	filters: FilterOptions
): CardType[] {
	let filtered = [...submissions];

	// Apply search filter
	if (filters.searchTerm) {
		const searchLower = filters.searchTerm.toLowerCase();
		filtered = filtered.filter((submission) => {
			const nameMatch = safeString(submission.name)
				.toLowerCase()
				.includes(searchLower);
			const serialMatch = safeString(submission.serial_number)
				.toLowerCase()
				.includes(searchLower);
			const brandMatch = safeString(submission.brand)
				.toLowerCase()
				.includes(searchLower);
			const gradeMatch = safeString(submission.grade_target)
				.toLowerCase()
				.includes(searchLower);

			return nameMatch || serialMatch || brandMatch || gradeMatch;
		});
	}

	// Apply sorting
	filtered.sort((a, b) => {
		let aValue: string | number;
		let bValue: string | number;

		switch (filters.sortBy) {
			case "name":
				aValue = safeString(a.name).toLowerCase();
				bValue = safeString(b.name).toLowerCase();
				break;
			case "serial_number":
				aValue = safeString(a.serial_number).toLowerCase();
				bValue = safeString(b.serial_number).toLowerCase();
				break;
			case "status":
				aValue = safeString(a.latest_status?.status).toLowerCase();
				bValue = safeString(b.latest_status?.status).toLowerCase();
				break;
			case "created_at":
			default:
				aValue = new Date(a.created_at).getTime();
				bValue = new Date(b.created_at).getTime();
				break;
		}

		let comparison = 0;
		if (aValue < bValue) {
			comparison = -1;
		} else if (aValue > bValue) {
			comparison = 1;
		}

		return filters.sortOrder === "desc" ? comparison * -1 : comparison;
	});

	return filtered;
}

/**
 * Get status statistics from submissions
 */
export function getSubmissionStats(submissions: CardType[]): SubmissionStats {
	const stats: SubmissionStats = {
		total: submissions.length,
		pending: 0,
		processing: 0,
		completed: 0,
		rejected: 0,
	};

	submissions.forEach((submission) => {
		const status = safeString(submission.latest_status?.status).toLowerCase();

		switch (status) {
			case "pending":
				stats.pending++;
				break;
			case "in_process":
			case "processing":
				stats.processing++;
				break;
			case "completed":
			case "done":
				stats.completed++;
				break;
			case "rejected":
			case "failed":
				stats.rejected++;
				break;
		}
	});

	return stats;
}

/**
 * Debounce function to limit API calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;

	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}
