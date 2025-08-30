import { useState, useEffect, useCallback } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { BsImage } from "react-icons/bs";
import formatDate from "../utils/FormatDate";
import axiosInstance from "../lib/axiosInstance";
import { BE_URL } from "../lib/api";
// Import from statusUtils
import { getStatusDisplayText, getStatusStyling } from "../utils/statusUtils";

// Types
interface StatusType {
  status: string;
  created_at: string;
}

interface DeliveryProof {
  id: number;
  card_id: string;
  image_path: string;
  created_at: string;
  updated_at: string;
}

interface DeliveryProofResponse {
  delivery_proofs: DeliveryProof[];
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
  cardId: string | number; 
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
    title: "Grading Facility Warehouse",
    description: "Processing at grading facility warehouse",
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
    title: "Professional Grading Process",
    description: "Professional card grading service",
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
    description: "Process completed successfully",
    statuses: ["done"],
    icon: "✅",
    color: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
      icon: "text-green-600"
    }
  }
];

export default function EnhancedTimeline({ statuses, currentStatus, grade, cardId }: EnhancedTimelineProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingProofs, setLoadingProofs] = useState(false);

  const currentStatusObj = statuses.find(s => s.status === currentStatus);
  const isCompleted = currentStatus === "done" || currentStatus === "completed";

  const fetchDeliveryProofs = useCallback(async () => {
    try {
      setLoadingProofs(true);
      const response = await axiosInstance.get(`/card/${cardId}/delivery-proof`);
      const data = response.data as DeliveryProofResponse;
      if (data && data.delivery_proofs) {
        setDeliveryProofs(data.delivery_proofs);
      }
    } catch (error) {
      console.error('Failed to fetch delivery proofs:', error);
    } finally {
      setLoadingProofs(false);
    }
  }, [cardId]);

  useEffect(() => {
    if (isCompleted && cardId) {
      fetchDeliveryProofs();
    }
  }, [isCompleted, cardId, fetchDeliveryProofs]);

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

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

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

        <div className={`border rounded-lg p-3 ${getStatusStyling(currentStatus, true)}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base">
                {getStatusDisplayText(currentStatus)}
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
                                    {getStatusDisplayText(statusKey)}
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

      {/* PSA Grade*/}
      {grade && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">PSA Grade</h4>

          <div className="text-center p-4 sm:p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-2">{grade}</div>
            <div className="text-sm sm:text-base text-yellow-700">Final Grade Result</div>
          </div>
        </div>
      )}

      {/* Delivery Proof Images - Only show when status is done/completed */}
      {isCompleted && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-3">
            <BsImage className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Delivery Confirmation</h4>
          </div>

          {loadingProofs ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6 mx-auto"></div>
              </div>
            </div>
          ) : deliveryProofs && deliveryProofs.length > 0 ? (
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Customer delivery confirmation images ({deliveryProofs.length} image{deliveryProofs.length > 1 ? 's' : ''})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deliveryProofs.map((proof, index) => (
                  <div
                    key={proof.id}
                    className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden group"
                  >
                    <img
                      src={`${BE_URL}/storage/${proof.image_path}`}
                      alt={`Delivery proof ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200 group-hover:opacity-90"
                      onClick={() => setSelectedImage(`${BE_URL}/storage/${proof.image_path}`)}
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatDate(new Date(proof.created_at))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BsImage className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-4" />
              <p className="text-xs sm:text-sm">No delivery confirmation images available</p>
            </div>
          )}
        </div>
      )}

      {/* Image Modal for Delivery Proofs */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full relative">
            <img
              src={selectedImage}
              alt="Delivery proof full size"
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}