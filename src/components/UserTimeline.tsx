import { useState, useEffect, useCallback } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { BsImage } from "react-icons/bs";
import formatDate from "@/utils/FormatDate";
import axiosInstance from "@/lib/axiosInstance";
import { BE_URL } from "@/lib/api";
import { getStatusStyling } from "@/utils/statusUtils";
import { useTimelineData } from "@/hooks/useTimelineData";
import TimelineItem from "@/components/TimelineItem";

// Types (same as Enhanced Timeline)
interface StatusType {
  id: number;
  card_id: string;
  status: string;
  created_at: string;
  updated_at: string;
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

interface MobileTimelineProps {
  statuses: StatusType[];
  currentStatus: string;
  grade?: string | null;
  cardId: string | number;
  variant?: "compact" | "full";
}

// Status text and phase groups resolved via useTimelineData

export default function MobileTimeline({ statuses, currentStatus, grade, cardId }: MobileTimelineProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingProofs, setLoadingProofs] = useState(false);

  const { phaseGroups, sortedStatuses, getGroupStatus, getStatusText } = useTimelineData(statuses as unknown as { id: number; card_id: string; status: string; created_at: string; updated_at: string }[], currentStatus);
  const currentStatusObj = sortedStatuses.find(s => s.status === currentStatus);
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

  // Fetch delivery proofs when status is completed
  useEffect(() => {
    if (isCompleted && cardId) {
      fetchDeliveryProofs();
    }
  }, [isCompleted, cardId, fetchDeliveryProofs]);

  // Get color classes for phase groups
  const getColorClasses = (color: string, status: string) => {
    // Custom styling for phase groups (different from individual status styling)
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
                Your delivery confirmation images ({deliveryProofs.length} image{deliveryProofs.length > 1 ? 's' : ''})
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