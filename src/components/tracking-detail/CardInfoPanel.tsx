import React from "react";
import formatDate from "@/utils/FormatDate";
import StatusBadge from "@/components/StatusBadge";
import CategoryBadge from "@/components/CategoryBadge";
import type { Card } from "@/types/card.types";

type Props = {
  card: Pick<Card, "name" | "year" | "brand" | "serial_number" | "grade" | "grade_target" | "created_at" | "latest_status" | "batch">;
  compact?: boolean;
  className?: string;
};

const CardInfoPanel: React.FC<Props> = ({ card, compact = false, className }) => {
  return (
    <div className={["bg-white border border-gray-200 rounded-lg shadow-sm", compact ? "p-4" : "p-6", className].filter(Boolean).join(" ")}> 
      <div className="flex justify-between items-start mb-4">
        <div className={compact ? "" : "flex items-center gap-2"}>
          <h1 className={compact ? "text-xl font-semibold text-gray-900" : "text-2xl font-semibold text-gray-900"}>{card.name}</h1>
          {!compact && <span className="text-sm text-gray-600">({card.year})</span>}
          {compact && <p className="text-sm text-gray-600">{card.brand} • {card.year}</p>}
        </div>
        <StatusBadge status={card.latest_status.status} />
      </div>

      <div className={[compact ? "grid grid-cols-1 gap-3 text-sm" : "space-y-3", ""].join(" ")}>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Brand:</span>
          <span className="text-gray-900">{card.brand}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Serial Number:</span>
          <span className="text-gray-900">{card.serial_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Verified Grade:</span>
          <span className="text-gray-900">{card.grade ?? "Pending"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Target Grade:</span>
          <span className="text-gray-900">{card.grade_target}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Submitted:</span>
          <span className="text-gray-900">{formatDate(new Date(card.created_at))}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Status:</span>
          <StatusBadge status={card.latest_status.status} />
        </div>
        {card.batch && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Batch:</span>
              <span className="text-gray-900">{card.batch.batch_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Register Number:</span>
              <span className="text-gray-900">{card.batch.register_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Category:</span>
              <CategoryBadge category={card.batch.category} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CardInfoPanel;


