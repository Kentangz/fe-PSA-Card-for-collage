import React from "react";

type Props = {
  label: string;
  date?: string;
  isCurrent: boolean;
  isCompleted: boolean;
};

const TimelineItem: React.FC<Props> = ({ label, date, isCurrent, isCompleted }) => {
  return (
    <li className="flex items-center gap-2 sm:gap-3 py-1" aria-current={isCurrent ? "step" : undefined}>
      <div
        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
          isCurrent ? "bg-blue-500 animate-pulse" : isCompleted ? "bg-green-500" : "bg-gray-300"
        }`}
      ></div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs sm:text-sm truncate ${
            isCurrent ? "text-blue-600 font-medium" : isCompleted ? "text-green-600" : "text-gray-500"
          }`}
        >
          {label}
        </p>
      </div>
      {date && <span className="text-xs text-gray-500 flex-shrink-0">{date}</span>}
    </li>
  );
};

export default TimelineItem;


