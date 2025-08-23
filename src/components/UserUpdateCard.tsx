import axiosInstance from "../lib/axiosInstance";
import { useState, useEffect, useCallback } from "react";
import { BE_URL } from "../lib/api";

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

type UploadResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    card_id: string;
    image_path: string;
    image_url: string;
    created_at: string;
  };
};

export default function UserUpdateCard({ card }: { card?: CardType }) {
  const [uploadingProof, setUploadingProof] = useState(false);
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deletingProofId, setDeletingProofId] = useState<number | null>(null);

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

  // Fetch existing delivery proofs
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

  // Handle delivery proof upload
  const handleDeliveryProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !card?.id) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPEG, PNG, JPG, or GIF images');
      return;
    }

    if (file.size > 2048 * 1024) { // 2MB in bytes
      alert('File size must be less than 2MB');
      return;
    }

    setUploadingProof(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.post<UploadResponse>(`/card/${card.id}/delivery-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Refresh delivery proofs
        await fetchDeliveryProofs();
        // Clear the input
        event.target.value = '';
        setPreviewImage(null);
      }
    } catch (error) {
      console.error("Error uploading delivery proof:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
                           error.response && typeof error.response === 'object' && 'data' in error.response &&
                           error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
                           ? String(error.response.data.message) 
                           : 'Failed to upload delivery proof';
      alert(errorMessage);
    } finally {
      setUploadingProof(false);
    }
  };

  // Handle delivery proof deletion
  const handleDeleteDeliveryProof = async (proofId: number) => {
    if (!card?.id) return;

    setDeletingProofId(proofId);
    
    try {
      const response = await axiosInstance.delete(`/card/${card.id}/delivery-proof/${proofId}`);
      
      if (response.status === 200) {
        // Refresh delivery proofs
        await fetchDeliveryProofs();
        
        // Close modal if the deleted image was being viewed
        if (selectedImage && selectedImage.includes(`delivery-proof/${proofId}`)) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error("Error deleting delivery proof:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
                           error.response && typeof error.response === 'object' && 'data' in error.response &&
                           error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
                           ? String(error.response.data.message) 
                           : 'Failed to delete delivery proof';
      alert(errorMessage);
    } finally {
      setDeletingProofId(null);
    }
  };

  // Handle image preview
  const handleImagePreview = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentStatus = card?.latest_status.status;

  // Show for delivery_to_jp status (existing functionality)
  if (currentStatus === "delivery_to_jp") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
        {/* Status Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              Delivery to Japan
            </span>
          </div>
        </div>

        {/* Action Section */}
        <div>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📦 Action Required</h4>
            <p className="text-sm text-blue-700">
              Please confirm when you have sent your card to Japan for grading.
            </p>
          </div>
          
          <button 
            onClick={() => handleUpdateSubmission("received_by_jp_wh")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirm Sent to Japan
          </button>
        </div>
      </div>
    );
  }

  // Show for payment_request status (existing functionality)
  if (currentStatus === "payment_request") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
        {/* Status Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              Payment Request
            </span>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-900 mb-2">💳 Payment Required</h4>
            <p className="text-sm text-green-700">
              Your card grading is complete! Please proceed with payment to continue with delivery.
            </p>
          </div>
          
          <div className="space-y-3">
            {/* Payment Link Button */}
            {card?.payment_url ? (
              <button 
                onClick={() => window.open(card.payment_url!, '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Proceed to Payment
              </button>
            ) : (
              <div className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-lg font-medium text-sm sm:text-base text-center">
                Payment link not available yet
              </div>
            )}

            {/* Confirm Payment Button */}
            <button 
              onClick={() => handleUpdateSubmission("delivery_to_customer")}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Payment
            </button>

            {/* Payment Instructions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">📋 Instructions:</h5>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Click "Proceed to Payment" to complete your payment</li>
                <li>2. After successful payment, click "Confirm Payment"</li>
                <li>3. Your card will be prepared for delivery</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MODIFIED: Show for received_by_customer status - now goes directly to "done"
  if (currentStatus === "received_by_customer") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
        {/* Status Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              Received by Customer
            </span>
          </div>
        </div>

        {/* Delivery Proof Section */}
        <div>
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="text-sm font-medium text-orange-900 mb-2">📸 Proof Required</h4>
            <p className="text-sm text-orange-700">
              Please upload photos as proof that you have received your graded card.
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Delivery Proof
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={(e) => {
                    handleImagePreview(e);
                    handleDeliveryProofUpload(e);
                  }}
                  disabled={uploadingProof}
                  className="hidden"
                  id="delivery-proof-upload"
                />
                <label
                  htmlFor="delivery-proof-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center ${
                    uploadingProof ? 'opacity-50' : 'hover:bg-gray-50'
                  } rounded-lg p-4 transition-colors`}
                >
                  {uploadingProof ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">Max 2MB • JPEG, PNG, JPG, GIF</p>
                    </>
                  )}
                </label>
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Uploaded Proofs */}
            {deliveryProofs.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Proofs ({deliveryProofs.length})
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {deliveryProofs.map((proof) => (
                    <div key={proof.id} className="relative group">
                      <img
                        src={`${BE_URL}/storage/${proof.image_path}`}
                        alt={`Delivery proof ${proof.id}`}
                        className="w-full h-20 sm:h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(`${BE_URL}/storage/${proof.image_path}`)}
                      />
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeliveryProof(proof.id);
                        }}
                        disabled={deletingProofId === proof.id}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete image"
                      >
                        {deletingProofId === proof.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        ) : (
                          "×"
                        )}
                      </button>
                      
                      {/* Success Badge */}
                      <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                        ✓
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODIFIED: Complete Submission Button - now goes directly to "done" */}
            {deliveryProofs.length > 0 && (
              <button 
                onClick={() => handleUpdateSubmission("done")}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Complete Submission
              </button>
            )}

            {/* MODIFIED: Updated Instructions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">📋 Instructions:</h5>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Take clear photos of your received graded card</li>
                <li>2. Upload multiple photos if needed (max 2MB each)</li>
                <li>3. Click "Complete Submission" when done</li>
                <li>4. Your submission will be automatically completed</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Image Modal */}
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

  // Return null if not matching any status that requires user action
  return null;
}