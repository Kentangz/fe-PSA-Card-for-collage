// src/utils/statusUtils.ts

// Status labels mapping - centralized for consistency
export const STATUS_LABELS: Record<string, string> = {
	submit: "Submit",
	received_by_us: "Received by Us",
	data_input: "Data Input",
	delivery_to_jp: "Delivery to Grading Facility",
	received_by_jp_wh: "Received by Grading Facility",
	delivery_to_psa: "Delivery to Grading Service",
	psa_arrival_of_submission: "Grading Service Arrival",
	psa_order_processed: "Grading Order Processed",
	psa_research: "Grading Research",
	psa_grading: "Grading in Progress",
	psa_holder_sealed: "Grading Holder Sealed",
	psa_qc: "Grading Quality Check",
	psa_grading_completed: "Grading Completed",
	psa_completion: "Grading Service Completion",
	delivery_to_jp_wh: "Delivery to Facility Warehouse",
	waiting_to_delivery_to_id: "Waiting Delivery to Indonesia",
	delivery_process_to_id: "Delivery Process to Indonesia",
	received_by_wh_id: "Received by Indonesia Warehouse",
	payment_request: "Payment Request",
	delivery_to_customer: "Delivery to Customer",
	received_by_customer: "Received by Customer",
	done: "Done",
	rejected: "Rejected",
	// Legacy status mappings for backward compatibility
};

/**
 * Get the display text for a status
 * @param status - The status code
 * @returns Human-readable status text
 */
export const getStatusDisplayText = (status: string): string => {
	if (!status) return "Unknown";

	const normalizedStatus = status.toLowerCase().trim();
	return STATUS_LABELS[normalizedStatus] || status.replace(/_/g, " ");
};

/**
 * Get the CSS classes for status styling
 * @param status - The status code
 * @param includeBorder - Whether to include border classes (default: false)
 * @returns CSS class string
 */
export const getStatusStyling = (
	status: string,
	includeBorder: boolean = false
): string => {
	if (!status)
		return includeBorder
			? "bg-gray-100 text-gray-800 border-gray-200"
			: "bg-gray-100 text-gray-800";

	const normalizedStatus = status.toLowerCase().trim();

	const baseClasses = (() => {
		switch (normalizedStatus) {
			case "submit":
			case "submitted":
				return "bg-orange-100 text-orange-800";
			case "received_by_us":
			case "accepted":
				return "bg-yellow-100 text-yellow-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "data_input":
			case "delivery_to_jp":
			case "received_by_jp_wh":
			case "delivery_to_psa":
			case "psa_arrival_of_submission":
			case "psa_order_processed":
			case "psa_research":
			case "psa_grading":
			case "psa_holder_sealed":
			case "psa_qc":
			case "psa_grading_completed":
			case "psa_completion":
			case "delivery_to_jp_wh":
			case "waiting_to_delivery_to_id":
			case "delivery_process_to_id":
			case "received_by_wh_id":
			case "payment_request":
			case "delivery_to_customer":
			case "received_by_customer":
			case "on process":
			case "processing":
			case "in_process":
			case "in process":
				return "bg-blue-100 text-blue-800";
			case "done":
			case "completed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	})();

	if (includeBorder) {
		const borderClass = baseClasses.includes("orange")
			? "border-orange-200"
			: baseClasses.includes("yellow")
			? "border-yellow-200"
			: baseClasses.includes("red")
			? "border-red-200"
			: baseClasses.includes("blue")
			? "border-blue-200"
			: baseClasses.includes("green")
			? "border-green-200"
			: "border-gray-200";
		return `${baseClasses} ${borderClass}`;
	}

	return baseClasses;
};

/**
 * Get the full CSS classes for a status badge
 * @param status - The status code
 * @param options - Additional options for the badge
 * @returns Object with CSS classes and display text
 */
export const getStatusBadgeClasses = (
	status: string,
	options: {
		includeBorder?: boolean;
		className?: string;
		maxWidth?: string;
	} = {}
) => {
	const { includeBorder = false, className = "", maxWidth } = options;

	const displayText = getStatusDisplayText(status);
	const styling = getStatusStyling(status, includeBorder);

	const baseClasses =
		`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styling} ${className}`.trim();
	const truncateClasses = maxWidth ? `truncate ${maxWidth}` : "";

	return {
		displayText,
		baseClasses,
		truncateClasses,
		fullClasses: `${baseClasses} ${truncateClasses}`.trim(),
	};
};

/**
 * Get batch category styling
 * @param category - The batch category
 * @param includeBorder - Whether to include border classes
 * @returns CSS class string
 */
export const getBatchCategoryStyling = (
	category: string,
	includeBorder: boolean = false
): string => {
	const baseClasses = (() => {
		switch (category) {
			case "PSA-Japan":
				return "bg-blue-100 text-blue-800";
			case "PSA-USA":
				return "bg-green-100 text-green-800";
			case "CGC":
				return "bg-purple-100 text-purple-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	})();

	if (includeBorder) {
		const borderClass = baseClasses.includes("blue")
			? "border-blue-200"
			: baseClasses.includes("green")
			? "border-green-200"
			: baseClasses.includes("purple")
			? "border-purple-200"
			: "border-gray-200";
		return `${baseClasses} ${borderClass}`;
	}

	return baseClasses;
};
