import axiosInstance from "../lib/axiosInstance";
import type { FormEvent } from "react";
import { useState, useEffect, useCallback } from "react";

// Type definition
type LatestStatus = {
  status: string;
};

type CardType = {
  id: string | number;
  latest_status: LatestStatus;
  payment_url?: string | null;
};

type DeliveryProof = {
  id: number;
  card_id: string;
  image_path: string;
  created_at: string;
  updated_at: string;
};

type DeliveryProofResponse = {
  card_id: string;
  card_name: string;
  delivery_proofs: DeliveryProof[];
};

type ButtonColor = 'green' | 'blue' | 'orange' | 'red' | 'gray';

export default function UpdateCard({ card }: { card?: CardType }) {
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGradeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const grade = formData.get("grade");
    const serialNumber = formData.get("serial_number");

    try {
      const response = await axiosInstance.put(`/card/${card?.id}`, { 
        grade: grade,
        serial_number: serialNumber 
      });
      if (response.status === 200) {
        await handleUpdateSubmission("received_by_wh_id");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle payment URL submit
  const handlePaymentUrlSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const paymentUrl = formData.get("payment_url");

    try {
      const response = await axiosInstance.put(`/card/${card?.id}`, { 
        payment_url: paymentUrl 
      });
      if (response.status === 200) {
        await handleUpdateSubmission("payment_request");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateSubmission = async (status: string) => {
    try {
      const response = await axiosInstance.post("/status", { 
        card_id: card?.id, 
        status: status 
      });
      if (response.status === 200) {
        window.location.reload(); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch delivery proofs for admin review
  const fetchDeliveryProofs = useCallback(async () => {
    if (!card?.id) return;
    
    try {
      const response = await axiosInstance.get<DeliveryProofResponse>(`/card/${card.id}/delivery-proof`);
      setDeliveryProofs(response.data.delivery_proofs || []);
    } catch (error) {
      console.error("Error fetching delivery proofs:", error);
      setDeliveryProofs([]);
    }
  }, [card?.id]);

  useEffect(() => {
    if (card?.latest_status.status === "received_by_customer") {
      fetchDeliveryProofs();
    }
  }, [card?.latest_status.status, fetchDeliveryProofs]);

  // Define workflow mapping - linear flow with next status
  const getStatusConfig = (currentStatus: string) => {
    const configs: Record<string, {
      nextStatus: string;
      nextLabel: string;
      hasReject: boolean;
      hasSpecialForm: boolean;
      isWaitingUser?: boolean;
    }> = {
      'submit': {
        nextStatus: 'received_by_us',
        nextLabel: 'Accept Submission',
        hasReject: true,
        hasSpecialForm: false
      },
      'received_by_us': {
        nextStatus: 'data_input',
        nextLabel: 'Start Data Input',
        hasReject: true,
        hasSpecialForm: false
      },
      'data_input': {
        nextStatus: 'delivery_to_jp',
        nextLabel: 'Send to Japan',
        hasReject: true,
        hasSpecialForm: false,
        isWaitingUser: true // ADDED: Admin waits for user action
      },
      'delivery_to_jp': {
        nextStatus: 'received_by_jp_wh',
        nextLabel: 'Mark as Received',
        hasReject: true,
        hasSpecialForm: false
      },
      'received_by_jp_wh': {
        nextStatus: 'delivery_to_psa',
        nextLabel: 'Send to PSA',
        hasReject: true,
        hasSpecialForm: false
      },
      'delivery_to_psa': {
        nextStatus: 'psa_arrival_of_submission',
        nextLabel: 'Mark PSA Arrival',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_arrival_of_submission': {
        nextStatus: 'psa_order_processed',
        nextLabel: 'Mark Order Processed',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_order_processed': {
        nextStatus: 'psa_research',
        nextLabel: 'Start Research',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_research': {
        nextStatus: 'psa_grading',
        nextLabel: 'Start Grading',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_grading': {
        nextStatus: 'psa_holder_sealed',
        nextLabel: 'Mark Holder Sealed',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_holder_sealed': {
        nextStatus: 'psa_qc',
        nextLabel: 'Start Quality Check',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_qc': {
        nextStatus: 'psa_grading_completed',
        nextLabel: 'Mark QC Complete',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_grading_completed': {
        nextStatus: 'psa_completion',
        nextLabel: 'Mark PSA Complete',
        hasReject: true,
        hasSpecialForm: false
      },
      'psa_completion': {
        nextStatus: 'delivery_to_jp_wh',
        nextLabel: 'Send to Japan Warehouse',
        hasReject: true,
        hasSpecialForm: false
      },
      'delivery_to_jp_wh': {
        nextStatus: 'waiting_to_delivery_to_id',
        nextLabel: 'Ready for Indonesia Delivery',
        hasReject: true,
        hasSpecialForm: false
      },
      'waiting_to_delivery_to_id': {
        nextStatus: 'delivery_process_to_id',
        nextLabel: 'Start Delivery to Indonesia',
        hasReject: true,
        hasSpecialForm: false
      },
      'delivery_process_to_id': {
        nextStatus: 'received_by_wh_id',
        nextLabel: 'Update Grade & Serial',
        hasReject: true,
        hasSpecialForm: true
      },
      'received_by_wh_id': {
        nextStatus: 'payment_request',
        nextLabel: 'Create Payment Request',
        hasReject: true,
        hasSpecialForm: true
      },
      'payment_request': {
        nextStatus: 'delivery_to_customer',
        nextLabel: 'Start Customer Delivery',
        hasReject: true,
        hasSpecialForm: false,
        isWaitingUser: true
      },
      'delivery_to_customer': {
        nextStatus: 'received_by_customer',
        nextLabel: 'Mark as Delivered',
        hasReject: true,
        hasSpecialForm: false
      },
      'received_by_customer': {
        nextStatus: 'done',
        nextLabel: 'Complete Process',
        hasReject: false,
        hasSpecialForm: false,
        isWaitingUser: true // Waiting for user to upload delivery proof
      }
    };

    return configs[currentStatus] || null;
  };

  // Get button styling
  const getButtonStyle = (color: ButtonColor) => {
    const styles: Record<ButtonColor, string> = {
      green: "bg-green-100 hover:bg-green-200 text-green-800 border-green-300",
      blue: "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300",
      orange: "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300",
      red: "bg-red-100 hover:bg-red-200 text-red-800 border-red-300",
      gray: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
    };
    return styles[color];
  };

  const currentStatus = card?.latest_status.status;
  const statusConfig = currentStatus ? getStatusConfig(currentStatus) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
      {/* Status Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Current Status:</span>
          <span className="text-sm font-medium text-gray-900 capitalize">
            {currentStatus?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* ADDED: Waiting for User Action - data_input */}
      {statusConfig?.isWaitingUser && currentStatus === "data_input" && (
        <div className="mb-4">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <h5 className="text-sm font-medium text-yellow-800">
                Waiting for User Action
              </h5>
            </div>
            <p className="text-sm text-yellow-700">
              User needs to confirm that the card has been sent to Japan before you can proceed to the next step.
            </p>
          </div>
        </div>
      )}

      {/* Waiting for User Action - delivery_to_jp */}
      {statusConfig?.isWaitingUser && currentStatus === "delivery_to_jp" && (
        <div className="mb-4">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <h5 className="text-sm font-medium text-yellow-800">
                Waiting for User Action
              </h5>
            </div>
            <p className="text-sm text-yellow-700">
              User needs to confirm that the card has been sent to Japan before you can proceed to the next step.
            </p>
          </div>
        </div>
      )}

      {/* Waiting for User Payment */}
      {statusConfig?.isWaitingUser && currentStatus === "payment_request" && (
        <div className="mb-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <h5 className="text-sm font-medium text-blue-800">
                Waiting for User Payment
              </h5>
            </div>
            <p className="text-sm text-blue-700">
              Payment link has been sent to user. Waiting for payment confirmation before proceeding.
            </p>
            {card?.payment_url && (
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="text-xs text-gray-600 mb-1">Payment URL sent:</p>
                <a 
                  href={card.payment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 break-all"
                >
                  {card.payment_url}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Waiting for User Delivery Proof - shows for received_by_customer */}
      {statusConfig?.isWaitingUser && currentStatus === "received_by_customer" && deliveryProofs.length === 0 && (
        <div className="mb-4">
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <h5 className="text-sm font-medium text-orange-800">
                Waiting for User Delivery Proof
              </h5>
            </div>
            <p className="text-sm text-orange-700">
              User needs to upload photos as proof that they have received their graded card.
            </p>
          </div>
        </div>
      )}

      {/* Special Form for delivery_process_to_id */}
      {currentStatus === "delivery_process_to_id" && statusConfig?.hasSpecialForm && (
        <div className="mb-4">
          <h5 className="text-base sm:text-lg lg:text-xl font-medium mb-3 lg:mb-4 text-gray-800">
            Update PSA Grade & Serial Number
          </h5>
          <form onSubmit={handleGradeSubmit}>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PSA Grade
                </label>
                <input 
                  type="text"
                  name="grade"
                  placeholder="Enter PSA grade"
                  className="w-full h-10 lg:h-12 px-3 lg:px-4 border border-gray-300 rounded bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PSA Serial Number
                </label>
                <input 
                  type="text"
                  name="serial_number"
                  placeholder="Enter PSA serial number"
                  className="w-full h-10 lg:h-12 px-3 lg:px-4 border border-gray-300 rounded bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                type="submit" 
                className={`${getButtonStyle('green')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
              >
                {statusConfig.nextLabel}
              </button>
              {statusConfig.hasReject && (
                <button 
                  type="button"
                  onClick={() => handleUpdateSubmission("rejected")} 
                  className={`${getButtonStyle('red')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
                >
                  Reject
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Special Form for received_by_wh_id (Payment URL) */}
      {currentStatus === "received_by_wh_id" && statusConfig?.hasSpecialForm && (
        <div className="mb-4">
          <h5 className="text-base sm:text-lg lg:text-xl font-medium mb-3 lg:mb-4 text-gray-800">
            Create Payment Request
          </h5>
          <form onSubmit={handlePaymentUrlSubmit}>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment URL
                </label>
                <input 
                  type="url"
                  name="payment_url"
                  placeholder="https://payment-gateway.com/pay/..."
                  className="w-full h-10 lg:h-12 px-3 lg:px-4 border border-gray-300 rounded bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the payment gateway URL where user can complete payment
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                type="submit" 
                className={`${getButtonStyle('green')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
              >
                {statusConfig.nextLabel}
              </button>
              {statusConfig.hasReject && (
                <button 
                  type="button"
                  onClick={() => handleUpdateSubmission("rejected")} 
                  className={`${getButtonStyle('red')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
                >
                  Reject
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Regular Action Buttons - FIXED: properly exclude all special status handling */}
      {statusConfig && 
       !statusConfig.hasSpecialForm && 
       !statusConfig.isWaitingUser && 
       currentStatus !== "done" && 
       currentStatus !== "rejected" && 
       currentStatus !== "delivery_to_jp" && 
       currentStatus !== "delivery_to_customer" && 
       currentStatus !== "received_by_customer" && (
        <div>
          <p className="text-blue-600 mb-3 lg:mb-4 font-medium text-sm sm:text-base">
            Available Actions:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => handleUpdateSubmission(statusConfig.nextStatus)} 
              className={`${getButtonStyle('green')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
            >
              {statusConfig.nextLabel}
            </button>
            {statusConfig.hasReject && (
              <button 
                onClick={() => handleUpdateSubmission("rejected")} 
                className={`${getButtonStyle('red')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* Show actions for delivery_to_jp (admin can proceed after user confirms) */}
      {currentStatus === "delivery_to_jp" && statusConfig && (
        <div>
          <p className="text-blue-600 mb-3 lg:mb-4 font-medium text-sm sm:text-base">
            Available Actions:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => handleUpdateSubmission(statusConfig.nextStatus)} 
              className={`${getButtonStyle('green')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
            >
              {statusConfig.nextLabel}
            </button>
            {statusConfig.hasReject && (
              <button 
                onClick={() => handleUpdateSubmission("rejected")} 
                className={`${getButtonStyle('red')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* Show actions for delivery_to_customer (admin can proceed manually) */}
      {currentStatus === "delivery_to_customer" && statusConfig && (
        <div>
          <p className="text-blue-600 mb-3 lg:mb-4 font-medium text-sm sm:text-base">
            Available Actions:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => handleUpdateSubmission(statusConfig.nextStatus)} 
              className={`${getButtonStyle('green')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
            >
              {statusConfig.nextLabel}
            </button>
            {statusConfig.hasReject && (
              <button 
                onClick={() => handleUpdateSubmission("rejected")} 
                className={`${getButtonStyle('red')} px-3 py-2 lg:px-4 lg:py-2.5 border rounded cursor-pointer transition-colors font-medium text-sm sm:text-base w-full sm:w-auto`}
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* Final Status Display */}
      {(currentStatus === "done" || currentStatus === "rejected") && (
        <div className="text-center py-4 lg:py-6">
          <div className={`inline-flex items-center px-3 py-2 lg:px-4 lg:py-3 border rounded-lg ${
            currentStatus === "done" 
              ? "bg-green-100 border-green-300" 
              : "bg-red-100 border-red-300"
          }`}>
            <svg 
              className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${
                currentStatus === "done" ? "text-green-600" : "text-red-600"
              }`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              {currentStatus === "done" ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              )}
            </svg>
            <span className={`font-medium text-sm sm:text-base ${
              currentStatus === "done" ? "text-green-800" : "text-red-800"
            }`}>
              {currentStatus === "done" ? "Process Completed" : "Submission Rejected"}
            </span>
          </div>
        </div>
      )}

      {/* Admin Override Section */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
          Admin Override
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded border">
          <p className="text-xs text-gray-600 mb-2">Jump to any status:</p>
          <select 
            onChange={(e) => {
              if (e.target.value) {
                handleUpdateSubmission(e.target.value);
              }
            }}
            className="text-xs px-2 py-1 border border-gray-300 rounded bg-white w-full"
          >
            <option value="">Select status...</option>
            <option value="submit">Submit</option>
            <option value="received_by_us">Received by Us</option>
            <option value="data_input">Data Input</option>
            <option value="delivery_to_jp">Delivery to JP</option>
            <option value="received_by_jp_wh">Received by JP WH</option>
            <option value="delivery_to_psa">Delivery to PSA</option>
            <option value="psa_arrival_of_submission">PSA Arrival</option>
            <option value="psa_order_processed">PSA Order Processed</option>
            <option value="psa_research">PSA Research</option>
            <option value="psa_grading">PSA Grading</option>
            <option value="psa_holder_sealed">PSA Holder Sealed</option>
            <option value="psa_qc">PSA QC</option>
            <option value="psa_grading_completed">PSA Grading Completed</option>
            <option value="psa_completion">PSA Completion</option>
            <option value="delivery_to_jp_wh">Delivery to JP WH</option>
            <option value="waiting_to_delivery_to_id">Waiting to Delivery ID</option>
            <option value="delivery_process_to_id">Delivery Process to ID</option>
            <option value="received_by_wh_id">Received by WH ID</option>
            <option value="payment_request">Payment Request</option>
            <option value="delivery_to_customer">Delivery to Customer</option>
            <option value="received_by_customer">Received by Customer</option>
            <option value="done">Done</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </details>

      {/* Image Modal for Delivery Proofs */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Delivery proof full size"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}