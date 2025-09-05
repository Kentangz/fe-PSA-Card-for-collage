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
		const completedCount = sortedStatuses.filter((s) =>
			groupStatuses.includes(s.status)
		).length;

		const totalCount = groupStatuses.length;
		const hasCurrent = groupStatuses.includes(currentStatus);

		if (completedCount === 0 && !hasCurrent) {
			return { status: "pending", progress: 0 } as const;
		}

		if (hasCurrent) {
			const currentIndex = groupStatuses.indexOf(currentStatus);
			const progressBasedOnPosition = ((currentIndex + 1) / totalCount) * 100;
			const progressBasedOnCompleted = (completedCount / totalCount) * 100;

			const progress = Math.min(
				Math.max(progressBasedOnPosition, progressBasedOnCompleted),
				100
			);

			return {
				status: "current",
				progress: Math.round(progress),
			} as const;
		}

		if (completedCount >= totalCount) {
			return { status: "completed", progress: 100 } as const;
		}

		const progress = Math.min((completedCount / totalCount) * 100, 100);
		return {
			status: "partial",
			progress: Math.round(progress),
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
