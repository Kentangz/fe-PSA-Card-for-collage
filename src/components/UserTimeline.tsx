import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import formatDate from "../utils/FormatDate";

// Types (same as Enhanced Timeline)
interface StatusType {
  id: number;
  card_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MobileTimelineProps {
  statuses: StatusType[];
  currentStatus: string;
  grade?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  "submit": "Submitted",
  "received_by_us": "Received",
  "data_input": "Data Input",
  "delivery_to_jp": "To Japan",
  "received_by_jp_wh": "JP Warehouse",
  "delivery_to_psa": "To PSA",
  "psa_arrival_of_submission": "PSA Arrival",
  "psa_order_processed": "PSA Processed",
  "psa_research": "PSA Research",
  "psa_grading": "PSA Grading",
  "psa_holder_sealed": "PSA Sealed",
  "psa_qc": "PSA QC",
  "psa_grading_completed": "PSA Complete",
  "psa_completion": "PSA Done",
  "delivery_to_jp_wh": "Return to JP",
  "waiting_to_delivery_to_id": "Waiting Return",
  "delivery_process_to_id": "To Indonesia",
  "received_by_wh_id": "ID Warehouse",
  "payment_request": "Payment",
  "delivery_to_customer": "Delivering",
  "received_by_customer": "Received",
  "done": "Complete",
  "rejected": "Rejected"
};

const PHASE_GROUPS = [
  {
    id: "processing",
    title: "Processing",
    icon: "📝",
    color: "blue",
    statuses: ["submit", "received_by_us", "data_input", "delivery_to_jp", "received_by_jp_wh"]
  },
  {
    id: "grading",
    title: "PSA Grading",
    icon: "⭐",
    color: "yellow",
    statuses: [
      "delivery_to_psa", "psa_arrival_of_submission", "psa_order_processed",
      "psa_research", "psa_grading", "psa_holder_sealed", "psa_qc",
      "psa_grading_completed", "psa_completion"
    ]
  },
  {
    id: "delivery",
    title: "Delivery",
    icon: "🚚",
    color: "green",
    statuses: [
      "delivery_to_jp_wh", "waiting_to_delivery_to_id", "delivery_process_to_id",
      "received_by_wh_id", "payment_request", "delivery_to_customer",
      "received_by_customer", "done"
    ]
  }
];

export default function MobileTimeline({ statuses, currentStatus, grade }: MobileTimelineProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const currentStatusObj = statuses.find(s => s.status === currentStatus);

  // Get group status
  const getGroupStatus = (groupStatuses: string[]) => {
    const completed = statuses.filter(s => groupStatuses.includes(s.status)).length;
    const hasCurrent = groupStatuses.includes(currentStatus);
    
    if (completed === 0) return { status: "pending", progress: 0 };
    if (hasCurrent) return { status: "current", progress: (completed / groupStatuses.length) * 100 };
    if (completed === groupStatuses.length) return { status: "completed", progress: 100 };
    return { status: "partial", progress: (completed / groupStatuses.length) * 100 };
  };

  const getColorClasses = (color: string, status: string) => {
    const colors = {
      blue: {
        current: "bg-blue-100 text-blue-800 border-blue-300",
        completed: "bg-blue-50 text-blue-700 border-blue-200",
        pending: "bg-gray-50 text-gray-600 border-gray-200"
      },
      yellow: {
        current: "bg-yellow-100 text-yellow-800 border-yellow-300",
        completed: "bg-yellow-50 text-yellow-700 border-yellow-200",
        pending: "bg-gray-50 text-gray-600 border-gray-200"
      },
      green: {
        current: "bg-green-100 text-green-800 border-green-300",
        completed: "bg-green-50 text-green-700 border-green-200",
        pending: "bg-gray-50 text-gray-600 border-gray-200"
      }
    };
    return colors[color as keyof typeof colors]?.[status as keyof typeof colors.blue] || colors.blue.pending;
  };

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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-blue-900 text-sm sm:text-base">
                {STATUS_LABELS[currentStatus] || currentStatus}
              </p>
              {currentStatusObj && (
                <p className="text-xs sm:text-sm text-blue-700 truncate">
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
          {PHASE_GROUPS.map((group) => {
            const { status, progress } = getGroupStatus(group.statuses);
            const isExpanded = expandedGroup === group.id;
            
            return (
              <div key={group.id} className="w-full">
                {/* Group Header */}
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${getColorClasses(group.color, status)}`}
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
                  <div className="mt-2 ml-2 sm:ml-4 space-y-2 overflow-hidden">
                    {group.statuses.map((statusKey) => {
                      const statusObj = statuses.find(s => s.status === statusKey);
                      const isCurrent = statusKey === currentStatus;
                      
                      return (
                        <div key={statusKey} className="flex items-center gap-2 sm:gap-3 py-1">
                          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                            isCurrent ? "bg-blue-500 animate-pulse" :
                            statusObj ? "bg-green-500" : "bg-gray-300"
                          }`}></div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs sm:text-sm truncate ${
                              isCurrent ? "text-blue-600 font-medium" :
                              statusObj ? "text-green-600" : "text-gray-500"
                            }`}>
                              {STATUS_LABELS[statusKey] || statusKey}
                            </p>
                          </div>
                          
                          {statusObj && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(new Date(statusObj.created_at))}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PSA Grade - Only show if grade exists */}
      {grade && (
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