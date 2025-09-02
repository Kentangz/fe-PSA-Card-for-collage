import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import formatDate from "@/utils/FormatDate";
import { getStatusStyling } from "@/utils/statusUtils";
import { useTimelineData } from "@/hooks/useTimelineData";
import TimelineItem from "@/components/TimelineItem";
import type { CardStatus } from "@/types/card.types";

interface UserTimelineProps {
  statuses: CardStatus[];
  currentStatus: string;
  grade?: string | null;
  variant?: "compact" | "full";
}

export default function UserTimeline({ statuses, currentStatus, grade, variant = "full" }: UserTimelineProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const { phaseGroups, sortedStatuses, getGroupStatus, getStatusText } = useTimelineData(
    statuses as unknown as { id: number; card_id: string; status: string; created_at: string; updated_at: string }[],
    currentStatus
  );

  const currentStatusObj = sortedStatuses.find(s => s.status === currentStatus);

  return (
    <div className="space-y-4 w-full max-w-none">
      {/* Current Status Highlight */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Current Status</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-blue-600 font-medium">Active</span>
          </div>
        </div>
        
        <div className={`border rounded-lg p-3 ${getStatusStyling(currentStatus, true)}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base">
                {getStatusText(currentStatus)}
              </p>
              {currentStatusObj && (
                <p className="text-xs sm:text-sm opacity-75 truncate">
                  {formatDate(new Date(currentStatusObj.created_at))}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phase Groups - Responsive */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">Phase Progress</h4>
        
        <div className="space-y-3">
          {phaseGroups.map((group) => {
            const { status, progress } = getGroupStatus([...group.statuses]);
            const isExpanded = expandedGroup === group.id;
            
            return (
              <div key={group.id} className="w-full">
                {/* Group Header */}
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${status === "completed" ? "bg-green-50 text-green-700 border-green-200" : status === "current" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="text-base sm:text-lg flex-shrink-0">{group.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{group.title}</p>
                        <p className="text-xs opacity-75">{Math.round(progress)}% complete</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {status === "completed" && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {status === "current" && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          status === "completed" ? "bg-green-500" :
                          status === "current" ? "bg-blue-500" : "bg-gray-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Group Details */}
                {isExpanded && (
                  <ol className="mt-2 ml-2 sm:ml-4 space-y-2 overflow-hidden">
                    {group.statuses.map((statusKey) => {
                      const statusObj = sortedStatuses.find((s) => s.status === statusKey);
                      const isCurrent = statusKey === currentStatus;
                      return (
                        <TimelineItem
                          key={statusKey}
                          label={getStatusText(statusKey)}
                          date={statusObj ? formatDate(new Date(statusObj.created_at)) : undefined}
                          isCurrent={isCurrent}
                          isCompleted={Boolean(statusObj)}
                        />
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PSA Grade - Only show if grade exists */}
      {grade && variant === "full" && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">PSA Grade</h4>
          
          <div className="text-center p-4 sm:p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-2">{grade}</div>
            <div className="text-sm sm:text-base text-yellow-700">Final Grade Result</div>
          </div>
        </div>
      )}
    </div>
  );
}