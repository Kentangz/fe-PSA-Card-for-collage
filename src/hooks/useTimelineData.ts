import { useMemo } from "react";
import { getStatusDisplayText } from "@/utils/statusUtils";
import type { CardStatus } from "@/types/card.types";

const PHASE_GROUPS = [
	{
		id: "processing",
		title: "Processing",
		icon: "📝",
		color: "blue",
		statuses: [
			"submit",
			"received_by_us",
			"data_input",
			"delivery_to_jp",
			"received_by_jp_wh",
		],
	},
	{
		id: "grading",
		title: "Grading",
		icon: "⭐",
		color: "yellow",
		statuses: [
			"delivery_to_psa",
			"psa_arrival_of_submission",
			"psa_order_processed",
			"psa_research",
			"psa_grading",
			"psa_holder_sealed",
			"psa_qc",
			"psa_grading_completed",
			"psa_completion",
		],
	},
	{
		id: "delivery",
		title: "Delivery",
		icon: "🚚",
		color: "green",
		statuses: [
			"delivery_to_jp_wh",
			"waiting_to_delivery_to_id",
			"delivery_process_to_id",
			"received_by_wh_id",
			"payment_request",
			"delivery_to_customer",
			"received_by_customer",
			"done",
		],
	},
] as const;

export type PhaseGroup = (typeof PHASE_GROUPS)[number];

export const useTimelineData = (
	statuses: CardStatus[],
	currentStatus: string
) => {
	const sortedStatuses = useMemo(() => {
		return [...statuses].sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		);
	}, [statuses]);

	const getGroupStatus = (groupStatuses: string[]) => {
		const completed = sortedStatuses.filter((s) =>
			groupStatuses.includes(s.status)
		).length;
		const hasCurrent = groupStatuses.includes(currentStatus);
		if (completed === 0) return { status: "pending", progress: 0 } as const;
		if (hasCurrent)
			return {
				status: "current",
				progress: (completed / groupStatuses.length) * 100,
			} as const;
		if (completed === groupStatuses.length)
			return { status: "completed", progress: 100 } as const;
		return {
			status: "partial",
			progress: (completed / groupStatuses.length) * 100,
		} as const;
	};

	const getStatusText = (status: string): string =>
		getStatusDisplayText(status);

	return {
		phaseGroups: PHASE_GROUPS,
		sortedStatuses,
		getGroupStatus,
		getStatusText,
	};
};
