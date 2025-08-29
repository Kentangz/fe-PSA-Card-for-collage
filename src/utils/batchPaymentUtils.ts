import type {
	CardType,
	BatchPaymentType,
	UserPaymentGroup,
	BatchPaymentsResponse,
} from "../types/submission";

export const transformToUserPaymentGroups = (
	submissions: CardType[],
	batchPaymentsData?: BatchPaymentsResponse
): UserPaymentGroup[] => {
	const submissionsByUser = new Map<number, CardType[]>();

	submissions.forEach((submission) => {
		const userId = submission.user_id;
		if (!submissionsByUser.has(userId)) {
			submissionsByUser.set(userId, []);
		}
		submissionsByUser.get(userId)!.push(submission);
	});

	const paymentsByUser = new Map<number, BatchPaymentType>();
	if (batchPaymentsData?.payments) {
		batchPaymentsData.payments.forEach((payment) => {
			paymentsByUser.set(payment.user_id, payment);
		});
	}

	const userGroups: UserPaymentGroup[] = [];

	submissionsByUser.forEach((userSubmissions, userId) => {
		const paymentInfo = paymentsByUser.get(userId) || null;
		let user;
		if (paymentInfo?.user) {
			user = paymentInfo.user;
		} else {
			user = {
				id: userId,
				name: `User ${userId}`,
				email: "",
				role: "user",
				is_active: true,
			};
		}

		userGroups.push({
			user,
			submissions: userSubmissions,
			paymentInfo,
		});
	});

	return userGroups.sort((a, b) => a.user.name.localeCompare(b.user.name));
};

export const getPaymentButtonState = (paymentInfo: BatchPaymentType | null) => {
	if (!paymentInfo) {
		return {
			text: "Send Payment Link",
			variant: "primary" as const,
			disabled: false,
			action: "create" as const,
		};
	}

	if (paymentInfo.is_sent) {
		return {
			text: "Payment Sent ✓",
			variant: "success" as const,
			disabled: true,
			action: "sent" as const,
			sentAt: paymentInfo.sent_at,
		};
	}

	if (paymentInfo.payment_url) {
		return {
			text: "Send Payment Link",
			variant: "primary" as const,
			disabled: false,
			action: "send" as const,
		};
	}

	return {
		text: "Set Payment URL",
		variant: "secondary" as const,
		disabled: false,
		action: "update" as const,
	};
};

export const formatSentAt = (sentAt: string | null): string => {
	if (!sentAt) return "";

	try {
		const date = new Date(sentAt);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "";
	}
};
