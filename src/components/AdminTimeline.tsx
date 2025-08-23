import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import formatDate from "../utils/FormatDate";

// Types
interface StatusType {
  status: string;
  created_at: string;
}

interface TimelinePhase {
  id: string;
  title: string;
  description: string;
  statuses: string[];
  icon: string;
  color: {
    bg: string;
    text: string;
    border: string;
    icon: string;
  };
}

interface EnhancedTimelineProps {
  statuses: StatusType[];
  currentStatus: string;
  grade?: string | null;
}

const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: "initial",
    title: "Initial Processing",
    description: "Card submission and initial processing",
    statuses: ["submit", "received_by_us", "data_input", "delivery_to_jp"],
    icon: "📝",
    color: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: "text-blue-600"
    }
  },
  {
    id: "japan_wh",
    title: "Japan Warehouse",
    description: "Processing at Japan warehouse",
    statuses: ["received_by_jp_wh", "delivery_to_psa"],
    icon: "🏢",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: "text-purple-600"
    }
  },
  {
    id: "psa_grading",
    title: "PSA Grading Process",
    description: "Professional card grading by PSA",
    statuses: [
      "psa_arrival_of_submission",
      "psa_order_processed",
      "psa_research",
      "psa_grading",
      "psa_holder_sealed",
      "psa_qc",
      "psa_grading_completed",
      "psa_completion"
    ],
    icon: "⭐",
    color: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: "text-yellow-600"
    }
  },
  {
    id: "return_process",
    title: "Return Process",
    description: "Returning graded card to Indonesia",
    statuses: ["delivery_to_jp_wh", "waiting_to_delivery_to_id", "delivery_process_to_id"],
    icon: "📦",
    color: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
      icon: "text-orange-600"
    }
  },
  {
    id: "final_delivery",
    title: "Final Delivery",
    description: "Payment and delivery to customer",
    statuses: ["received_by_wh_id", "payment_request", "delivery_to_customer", "received_by_customer"],
    icon: "🚚",
    color: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
      icon: "text-green-600"
    }
  },
  {
    id: "completion",
    title: "Completion",
    description: "Process completed or rejected",
    statuses: ["done", "rejected"],
    icon: "✅",
    color: {
      bg: "bg-gray-50",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: "text-gray-600"
    }
  }
];

const STATUS_LABELS: Record<string, string> = {
  "submit": "Submitted",
  "received_by_us": "Received by Us",
  "data_input": "Data Input",
  "delivery_to_jp": "Delivery to Japan",
  "received_by_jp_wh": "Received by JP Warehouse",
  "delivery_to_psa": "Delivery to PSA",
  "psa_arrival_of_submission": "PSA Arrival",
  "psa_order_processed": "PSA Order Processed",
  "psa_research": "PSA Research",
  "psa_grading": "PSA Grading",
  "psa_holder_sealed": "PSA Holder Sealed",
  "psa_qc": "PSA Quality Check",
  "psa_grading_completed": "PSA Grading Completed",
  "psa_completion": "PSA Completion",
  "delivery_to_jp_wh": "Delivery to JP Warehouse",
  "waiting_to_delivery_to_id": "Waiting Delivery to Indonesia",
  "delivery_process_to_id": "Delivery Process to Indonesia",
  "received_by_wh_id": "Received by Indonesia Warehouse",
  "payment_request": "Payment Request",
  "delivery_to_customer": "Delivery to Customer",
  "received_by_customer": "Received by Customer",
  "done": "Completed",
  "rejected": "Rejected"
};

export default function EnhancedTimeline({ statuses, currentStatus, grade }: EnhancedTimelineProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const currentStatusObj = statuses.find(s => s.status === currentStatus);

  // Get phase status (completed, current, pending)
  const getPhaseStatus = (phase: TimelinePhase) => {
    const phaseStatuses = statuses.filter(s => phase.statuses.includes(s.status));
    const hasCurrentStatus = phase.statuses.includes(currentStatus);
    
    if (phase.statuses.includes("done") || phase.statuses.includes("rejected")) {
      const finalStatus = statuses.find(s => s.status === "done" || s.status === "rejected");
      if (finalStatus) return "completed";
    }
    
    if (phaseStatuses.length === 0) return "pending";
    if (hasCurrentStatus) return "current";
    if (phaseStatuses.length > 0) return "completed";
    return "pending";
  };

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  // Get status icon
  const getStatusIcon = (status: string, isActive: boolean) => {
    if (status === currentStatus && isActive) {
      return (
        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 animate-pulse flex items-center justify-center">
          <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-white"></div>
        </div>
      );
    }
    
    const statusObj = statuses.find(s => s.status === status);
    if (statusObj) {
      return (
        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex items-center justify-center">
          <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-white"></div>
        </div>
      );
    }
    
    return (
      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-300 flex items-center justify-center">
        <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-gray-500"></div>
      </div>
    );
  };

  // Get phase progress
  const getPhaseProgress = (phase: TimelinePhase) => {
    const completed = statuses.filter(s => phase.statuses.includes(s.status)).length;
    const total = phase.statuses.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
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

      {/* Timeline Phases - Responsive */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">Phase Progress</h4>
        
        <div className="space-y-3">
          {TIMELINE_PHASES.map((phase) => {
            const phaseStatus = getPhaseStatus(phase);
            const progress = getPhaseProgress(phase);
            const isExpanded = expandedPhases.has(phase.id);

            return (
              <div
                key={phase.id}
                className={`border rounded-lg transition-all duration-200 ${
                  phaseStatus === "current" 
                    ? `${phase.color.border} ${phase.color.bg} shadow-md` 
                    : phaseStatus === "completed"
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Phase Header */}
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => togglePhase(phase.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {/* Phase Icon */}
                      <div className={`text-lg sm:text-2xl ${phase.color.icon} flex-shrink-0`}>
                        {phase.icon}
                      </div>
                      
                      {/* Phase Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-medium text-sm sm:text-base ${phase.color.text} truncate`}>
                          {phase.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {phase.description}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge and Expand Button */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                      {/* Progress */}
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-medium text-gray-700">
                          {progress.completed}/{progress.total}
                        </div>
                        <div className="text-xs text-gray-500">
                          {progress.percentage}%
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        phaseStatus === "completed" 
                          ? "bg-green-100 text-green-800"
                          : phaseStatus === "current"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {phaseStatus === "completed" ? "✓" :
                         phaseStatus === "current" ? "⏳" : "⏸"}
                      </div>

                      {/* Expand Icon */}
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Phase Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-3 overflow-hidden">
                    <div className="space-y-2 sm:space-y-3">
                      {phase.statuses.map((statusKey, index) => {
                        const statusObj = statuses.find(s => s.status === statusKey);
                        const isCurrentStep = statusKey === currentStatus;
                        
                        return (
                          <div key={statusKey} className="flex items-start gap-2 sm:gap-3">
                            {/* Timeline Line */}
                            <div className="flex flex-col items-center">
                              {getStatusIcon(statusKey, isCurrentStep)}
                              {index < phase.statuses.length - 1 && (
                                <div className="w-px h-4 sm:h-6 bg-gray-300 mt-1"></div>
                              )}
                            </div>

                            {/* Status Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className={`font-medium text-xs sm:text-sm truncate ${
                                    isCurrentStep ? "text-blue-600" : 
                                    statusObj ? "text-green-600" : "text-gray-500"
                                  }`}>
                                    {STATUS_LABELS[statusKey] || statusKey}
                                  </p>
                                  
                                  {/* Special messages */}
                                  {statusKey === "done" && grade && (
                                    <p className="text-xs text-green-600 mt-1 truncate">
                                      Grade: {grade}
                                    </p>
                                  )}
                                  
                                  {isCurrentStep && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Processing...
                                    </p>
                                  )}
                                </div>

                                {/* Timestamp */}
                                {statusObj && (
                                  <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {formatDate(new Date(statusObj.created_at))}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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