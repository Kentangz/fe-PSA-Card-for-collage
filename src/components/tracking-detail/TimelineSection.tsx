import React from "react";
import UserTimeline from "@/components/UserTimeline";
import type { CardStatus } from "@/types/card.types";

type Props = {
  statuses: CardStatus[];
  currentStatus: string;
  grade: string | null;
  className?: string;
  variant?: "compact" | "full";
};

const TimelineSection: React.FC<Props> = ({ statuses, currentStatus, grade, className, variant = "full" }) => {
  return (
    <div className={className}>
      <UserTimeline statuses={statuses} currentStatus={currentStatus} grade={grade} variant={variant} />
    </div>
  );
};

export default TimelineSection;


