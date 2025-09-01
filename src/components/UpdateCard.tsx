import axiosInstance from "../lib/axiosInstance";
import type { FormEvent } from "react";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { batchPaymentService } from "../services/batchPaymentService";
import type { BatchPaymentType } from "../types/submission";
import { getStatusDisplayText } from "../utils/statusUtils";

// Type definition
type LatestStatus = {
  status: string;
};

type CardType = {
  id: string | number;
  user_id: number;
  batch_id?: number;
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
  const [batchPayment, setBatchPayment] = useState<BatchPaymentType | null>(null);
  const [isFetchingBatchPayment, setIsFetchingBatchPayment] = useState(false);
  const [batchPaymentError, setBatchPaymentError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<{cert_url: string}[]>([{cert_url: ''}]);

    const fetchBatchPayment = useCallback(async () => {
    if (!card?.batch_id || !card?.user_id) return;
    
    setIsFetchingBatchPayment(true);
    setBatchPaymentError(null);
    
    try {
      const response = await batchPaymentService.getByBatch(card.batch_id);
      const userBatchPayment = response.payments.find(
        payment => payment.user_id === card.user_id
      );
      
      setBatchPayment(userBatchPayment || null);
    } catch (error) {
      console.error("Error fetching batch payment:", error);
      setBatchPaymentError("Failed to fetch batch payment data");
      setBatchPayment(null);
    } finally {
      setIsFetchingBatchPayment(false);
    }
    }, [card?.batch_id, card?.user_id]);
  
    useEffect(() => {
    if (card?.latest_status.status === "received_by_wh_id") {
      fetchBatchPayment();
    }
    }, [card?.latest_status.status, fetchBatchPayment]);
  
  const handleGradeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const grade = formData.get("grade");
    const serialNumber = formData.get("serial_number");

    // Validasi certificates - semua field harus diisi
    const hasEmptyCertificates = certificates.some(cert => !cert.cert_url.trim());
    if (hasEmptyCertificates) {
      alert("Please fill in all certificate links");
      return;
    }

    try {
      const response = await axiosInstance.put(`/card/${card?.id}`, { 
        grade: grade,
        serial_number: serialNumber,
        certificates: certificates
      });
      if (response.status === 200) {
        await handleUpdateSubmission("received_by_wh_id");
      }
    } catch (error) {
      console.error(error);
    }
  };
    // Handler untuk menambah cert link field
  const addCertificateField = () => {
    if (certificates.length < 5) {
      setCertificates([...certificates, {cert_url: ''}]);
    }
  };

  // Handler untuk menghapus cert link field
  const removeCertificateField = (index: number) => {
    if (certificates.length > 1) {
      const newCertificates = certificates.filter((_, i) => i !== index);
      setCertificates(newCertificates);
    }
  };

  // Handler untuk update cert link value
  const updateCertificateField = (index: number, value: string) => {
    const newCertificates = certificates.map((cert, i) => 
      i === index ? {cert_url: value} : cert
    );
    setCertificates(newCertificates);
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
    const handleSendPaymentLink = async () => {
    if (!batchPayment?.id) return;
    
    try {
      await batchPaymentService.sendPaymentLink(batchPayment.id);
      await fetchBatchPayment();
      
      console.log("Payment link sent successfully");
    } catch (error) {
      console.error("Error sending payment link:", error);
    }
  };
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

const getStatusConfig = (currentStatus: string) => {
  const configs: Record<string, {
    nextStatus: string;
    nextLabel: string;
    hasReject: boolean;
    hasSpecialForm: boolean;
    isWaitingUser?: boolean;
    isBatchPaymentStatus?: boolean;
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
      nextLabel: 'Send to Grading Facility',
      hasReject: true,
      hasSpecialForm: false,
      isWaitingUser: true
    },
    'delivery_to_jp': {
      nextStatus: 'received_by_jp_wh',
      nextLabel: 'Mark Facility Receipt',
      hasReject: true,
      hasSpecialForm: false
    },
    'received_by_jp_wh': {
      nextStatus: 'delivery_to_psa',
      nextLabel: 'Send to Grading Service',
      hasReject: true,
      hasSpecialForm: false
    },
    'delivery_to_psa': {
      nextStatus: 'psa_arrival_of_submission',
      nextLabel: 'Mark Service Arrival',
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
      nextLabel: 'Mark Service Complete',
      hasReject: true,
      hasSpecialForm: false
    },
    'psa_completion': {
      nextStatus: 'delivery_to_jp_wh',
      nextLabel: 'Send to Facility Warehouse',
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
      nextLabel: 'Process via Batch Payment',
      hasReject: true,
      hasSpecialForm: false,
      isBatchPaymentStatus: true
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
      isWaitingUser: true
    }
  };

  return configs[currentStatus] || null;
};
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
      {/* Status Display */}
      <div className="mb-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-3">
          <span className="text-sm font-medium text-gray-600">Current Status:</span>
          <span className="text-sm font-medium text-gray-900 capitalize bg-gray-50 px-3 py-1 rounded-full">
            {getStatusDisplayText(currentStatus || '')}
          </span>
        </div>
      </div>

      {/* Waiting for User Action - data_input */}
      {statusConfig?.isWaitingUser && currentStatus === "data_input" && (
        <div className="mb-6">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0"></div>
              <h5 className="text-sm font-medium text-yellow-800">
                Waiting for User Action
              </h5>
            </div>
            <p className="text-sm text-yellow-700 leading-relaxed">
              User needs to confirm that the card has been sent to grading facility before you can proceed to the next step.
            </p>
          </div>
        </div>
      )}

      {/* Waiting for User Action - delivery_to_jp */}
      {statusConfig?.isWaitingUser && currentStatus === "delivery_to_jp" && (
        <div className="mb-6">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0"></div>
              <h5 className="text-sm font-medium text-yellow-800">
                Waiting for User Action
              </h5>
            </div>
            <p className="text-sm text-yellow-700 leading-relaxed">
              User needs to confirm that the card has been sent to grading facility before you can proceed to the next step.
            </p>
          </div>
        </div>
      )}

      {/* Waiting for User Payment */}
      {statusConfig?.isWaitingUser && currentStatus === "payment_request" && (
        <div className="mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
              <h5 className="text-sm font-medium text-blue-800">
                Waiting for User Payment
              </h5>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed mb-3">
              Payment link has been sent to user. Waiting for payment confirmation before proceeding.
            </p>
            {card?.payment_url && (
              <div className="p-3 bg-white rounded border">
                <p className="text-xs text-gray-600 mb-1">Payment URL sent:</p>
                <a 
                  href={card.payment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 break-all block"
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
        <div className="mb-6">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse flex-shrink-0"></div>
              <h5 className="text-sm font-medium text-orange-800">
                Waiting for User Delivery Proof
              </h5>
            </div>
            <p className="text-sm text-orange-700 leading-relaxed">
              User needs to upload photos as proof that they have received their graded card.
            </p>
          </div>
        </div>
      )}

      {/* Special Form for delivery_process_to_id */}
      {currentStatus === "delivery_process_to_id" && statusConfig?.hasSpecialForm && (
        <div className="mb-6">
          <h5 className="text-lg font-medium mb-4 text-gray-800">
             Update Grading Result & Serial Number
          </h5>
          <form onSubmit={handleGradeSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <input 
                  type="text"
                  name="grade"
                  placeholder="Enter grade result"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input 
                  type="text"
                  name="serial_number"
                  placeholder="Enter serial number"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Cert Links
                </label>
                <div className="space-y-3">
                  {certificates.map((cert, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        type="text"
                        value={cert.cert_url}
                        onChange={(e) => updateCertificateField(index, e.target.value)}
                        placeholder="https://d1htnxwo4o0jhw.cloudfront.net/cert/...."
                        className="flex-1 h-12 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                        required
                      />
                      
                      {/* Remove button - hanya tampil jika lebih dari 1 field */}
                      {certificates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCertificateField(index)}
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-300 hover:border-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add button - hanya tampil jika belum mencapai maksimal */}
                  {certificates.length < 5 && (
                    <button
                      type="button"
                      onClick={addCertificateField}
                      className="w-full h-10 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-300 hover:border-blue-400 border-dashed transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Certificate Link
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="submit" 
                className={`${getButtonStyle('green')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
              >
                {statusConfig.nextLabel}
              </button>
              {statusConfig.hasReject && (
                <button 
                  type="button"
                  onClick={() => handleUpdateSubmission("rejected")} 
                  className={`${getButtonStyle('red')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
                >
                  Reject
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* UPDATED: Batch Payment*/}
      {currentStatus === "received_by_wh_id" && (
        <div className="mb-6">
          {/* Loading state */}
          {isFetchingBatchPayment && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading batch payment status...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {batchPaymentError && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">{batchPaymentError}</p>
              <button 
                onClick={fetchBatchPayment}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Case 1: No batch payment found*/}
          {!isFetchingBatchPayment && !batchPaymentError && !batchPayment && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">
                    Use Batch Payment System
                  </h5>
                  <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                    Payment requests are now handled per-user for all submissions in a batch. 
                    This allows users to pay once for all their submissions instead of paying individually.
                  </p>
                  <div className="mb-4">
                    <Link 
                      to="/dashboard/admin/submissions"
                      className={`${getButtonStyle('blue')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base no-underline inline-block text-center w-full sm:w-auto`}
                    >
                      Go to Batch Payment Management
                    </Link>
                  </div>
                  <div className="text-xs text-blue-600">
                    <p className="font-medium mb-2">Benefits of Batch Payment:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Users pay once for multiple submissions</li>
                      <li>Better user experience and lower transaction fees</li>
                      <li>Centralized payment management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case 2*/}
          {!isFetchingBatchPayment && batchPayment && !batchPayment.is_sent && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-yellow-800 mb-2">
                    Payment Link Ready to Send
                  </h5>
                  <p className="text-sm text-yellow-700 mb-4 leading-relaxed">
                    Payment URL has been created for this user but hasn't been sent yet. 
                    Click the button below to send the payment link to the user.
                  </p>
                  <div className="mb-3">
                    <p className="text-xs text-yellow-600 mb-1">Payment URL:</p>
                    <div className="p-2 bg-white rounded border text-xs text-gray-800 break-all">
                      {batchPayment.payment_url}
                    </div>
                  </div>
                  <button 
                    onClick={handleSendPaymentLink}
                    className={`${getButtonStyle('green')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base w-full sm:w-auto`}
                  >
                    Send Payment Link to User
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Case 3: Batch payment exists and sent - Show "Proceed to Payment Request" */}
          {!isFetchingBatchPayment && batchPayment && batchPayment.is_sent && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-green-800 mb-2">
                    Payment Link Sent Successfully
                  </h5>
                  <p className="text-sm text-green-700 mb-4 leading-relaxed">
                    Payment link has been sent to the user on {new Date(batchPayment.sent_at!).toLocaleDateString()}. 
                    You can now proceed to update the status to "Payment Request".
                  </p>
                  <div className="mb-3">
                    <p className="text-xs text-green-600 mb-1">Payment URL sent:</p>
                    <div className="p-2 bg-white rounded border text-xs text-gray-800 break-all">
                      {batchPayment.payment_url}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUpdateSubmission("payment_request")}
                    className={`${getButtonStyle('green')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base w-full sm:w-auto`}
                  >
                    Proceed to Payment Request Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Regular Action Buttons - Updated to exclude batch payment status */}
      {statusConfig && 
       !statusConfig.hasSpecialForm && 
       !statusConfig.isWaitingUser && 
       !statusConfig.isBatchPaymentStatus &&
       currentStatus !== "done" && 
       currentStatus !== "rejected" && 
       currentStatus !== "delivery_to_jp" && 
       currentStatus !== "delivery_to_customer" && 
       currentStatus !== "received_by_customer" && (
        <div className="mb-6">
          <p className="text-blue-600 mb-4 font-medium text-base">
            Available Actions:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleUpdateSubmission(statusConfig.nextStatus)} 
              className={`${getButtonStyle('green')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
            >
              {statusConfig.nextLabel}
            </button>
            {statusConfig.hasReject && (
              <button 
                onClick={() => handleUpdateSubmission("rejected")} 
                className={`${getButtonStyle('red')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* Show actions for delivery_to_jp (admin can proceed after user confirms) */}
      {currentStatus === "delivery_to_jp" && statusConfig && (
        <div className="mb-6">
          <p className="text-blue-600 mb-4 font-medium text-base">
            Available Actions:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleUpdateSubmission(statusConfig.nextStatus)} 
              className={`${getButtonStyle('green')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
            >
              {statusConfig.nextLabel}
            </button>
            {statusConfig.hasReject && (
              <button 
                onClick={() => handleUpdateSubmission("rejected")} 
                className={`${getButtonStyle('red')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* Show actions for delivery_to_customer (admin can proceed manually) */}
      {currentStatus === "delivery_to_customer" && statusConfig && (
        <div className="mb-6">
          <p className="text-blue-600 mb-4 font-medium text-base">
            Available Actions:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleUpdateSubmission(statusConfig.nextStatus)} 
              className={`${getButtonStyle('green')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
            >
              {statusConfig.nextLabel}
            </button>
            {statusConfig.hasReject && (
              <button 
                onClick={() => handleUpdateSubmission("rejected")} 
                className={`${getButtonStyle('red')} px-6 py-3 border rounded-lg cursor-pointer transition-colors font-medium text-base flex-1 sm:flex-initial min-w-0`}
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}

      {/* Final Status Display */}
      {(currentStatus === "done" || currentStatus === "rejected") && (
        <div className="text-center py-8">
          <div className={`inline-flex items-center px-6 py-4 border rounded-lg ${
            currentStatus === "done" 
              ? "bg-green-100 border-green-300" 
              : "bg-red-100 border-red-300"
          }`}>
            <svg 
              className={`w-5 h-5 mr-3 flex-shrink-0 ${
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
            <span className={`font-medium text-base ${
              currentStatus === "done" ? "text-green-800" : "text-red-800"
            }`}>
              {currentStatus === "done" ? "Process Completed" : "Submission Rejected"}
            </span>
          </div>
        </div>
      )}

      {/* Admin Override Section */}
      <details className="mt-6">
        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 font-medium mb-3">
          Admin Override
        </summary>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600 mb-3">Jump to any status:</p>
        <select 
          onChange={(e) => {
            if (e.target.value) {
              handleUpdateSubmission(e.target.value);
            }
          }}
          className="text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white w-full h-10 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select status...</option>
          <option value="submit">Submit</option>
          <option value="received_by_us">Received by Us</option>
          <option value="data_input">Data Input</option>
          <option value="delivery_to_jp">Delivery to Grading Facility</option>
          <option value="received_by_jp_wh">Received by Grading Facility</option>
          <option value="delivery_to_psa">Delivery to Grading Service</option>
          <option value="psa_arrival_of_submission">Grading Service Arrival</option>
          <option value="psa_order_processed">Grading Order Processed</option>
          <option value="psa_research">Grading Research</option>
          <option value="psa_grading">Grading in Progress</option>
          <option value="psa_holder_sealed">Grading Holder Sealed</option>
          <option value="psa_qc">Grading Quality Check</option>
          <option value="psa_grading_completed">Grading Completed</option>
          <option value="psa_completion">Grading Service Completion</option>
          <option value="delivery_to_jp_wh">Delivery to Facility Warehouse</option>
          <option value="waiting_to_delivery_to_id">Waiting Delivery to Indonesia</option>
          <option value="delivery_process_to_id">Delivery Process to Indonesia</option>
          <option value="received_by_wh_id">Received by Indonesia Warehouse</option>
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