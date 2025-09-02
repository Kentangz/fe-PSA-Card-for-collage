import React, { Suspense } from "react";
const UserTimeline = React.lazy(() => import("@/components/UserTimeline"));
import type { CardStatus } from "@/types/card.types";

type Props = {
  statuses: CardStatus[];
  currentStatus: string;
  grade: string | null;
  cardId: string;
  className?: string;
  variant?: "compact" | "full";
};

const TimelineSection: React.FC<Props> = ({ statuses, currentStatus, grade, cardId, className, variant = "full" }) => {
  return (
    <div className={className}>
      <Suspense fallback={<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-32 animate-pulse"></div>}>
        <UserTimeline statuses={statuses} currentStatus={currentStatus} grade={grade} cardId={cardId} variant={variant} />
      </Suspense>
    </div>
  );
};

export default TimelineSection;


