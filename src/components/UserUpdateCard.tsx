import { useState, useEffect, useCallback, useRef } from "react";
import { getStatusDisplayText } from "@/utils/statusUtils";
// import { getImageUrl } from "@/utils/imageUtils";
import { useDeliveryProofs } from "@/hooks/useDeliveryProofs";
import { useStatusActions } from "@/hooks/useStatusActions";
import PreviewGrid from "@/components/user-update/PreviewGrid";
import ProofsGrid from "@/components/user-update/ProofsGrid";
import ActionButtons from "@/components/user-update/ActionButtons";
import UploadDropzone from "@/components/user-update/UploadDropzone";

// Type definition
type LatestStatus = {
  status: string;
};

type CardType = {
  id: string | number;
  latest_status: LatestStatus;
  payment_url?: string | null;
};

// Delivery proof shape comes from services/hooks

// (Responses moved to services; not needed locally)

// Removed window upload state globals; using local state only

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

// Extend Window interface to include our custom properties
// No global window declarations required

export default function UserUpdateCard({ card }: { card?: CardType }) {
  const [uploadingProof, setUploadingProof] = useState(false);
  const { deliveryProofs, fetchProofs, uploadFiles, deleteProof, deletingId } = useDeliveryProofs(card?.id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string; id: string }[]>([]);
  const [uploadSuccessful, setUploadSuccessful] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current status early
  const currentStatus = card?.latest_status.status;
  
  const fetchDeliveryProofs = useCallback(() => { fetchProofs(); }, [fetchProofs]);
  
  // Delivery proofs syncing handled by useDeliveryProofs
  
  // Persistent state preservation for multiple files
  const preservedState = useRef<{
    previewImages: { file: File; preview: string; id: string }[];
    uploadSuccessful: boolean;
    timestamp: number;
    cancelled?: boolean; // Add cancelled flag
    cancelledTimestamp?: number;
  }>({
    previewImages: [],
    uploadSuccessful: false,
    timestamp: 0,
    cancelled: false,
    cancelledTimestamp: 0
  });
  
  // Preserve local state only (no window globals)
  useEffect(() => {
    preservedState.current = {
      previewImages,
      uploadSuccessful,
      timestamp: Date.now()
    };
  }, [previewImages, uploadSuccessful]);
  
  // Restore recent local state on mount only
  useEffect(() => {
    if (
      preservedState.current.previewImages.length > 0 &&
      !preservedState.current.uploadSuccessful &&
      preservedState.current.timestamp > Date.now() - 30000
    ) {
      setPreviewImages(preservedState.current.previewImages);
      setUploadSuccessful(false);
    }
  }, []);
  
  // Resize handler: optionally restore from preserved state only
  const handleResize = useCallback(() => {
    if (
      preservedState.current.previewImages.length > 0 &&
      !preservedState.current.uploadSuccessful &&
      previewImages.length === 0 &&
      !uploadSuccessful &&
      Date.now() - preservedState.current.timestamp > 1000
    ) {
      setPreviewImages(preservedState.current.previewImages);
    }
  }, [previewImages, uploadSuccessful]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  // Interval recovery - PROPERLY FIXED WITH useCallback TO AVOID DEPENDENCY ISSUES
  const checkInterval = useCallback(() => {
    // No-op; kept for minimal interval work if needed later
  }, []);

  useEffect(() => {
    const interval = setInterval(checkInterval, 300); // More frequent checking for better responsiveness
    return () => clearInterval(interval);
  }, [checkInterval]);

  useEffect(() => {
    if (currentStatus === "received_by_customer") {
      fetchDeliveryProofs();
    }
  }, [currentStatus, fetchDeliveryProofs]);

  const { handleUpdateSubmission } = useStatusActions(card?.id);

  // Generate unique ID for file tracking
  const generateFileId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  // Handle multiple file selection
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxFileSize = 2048 * 1024; // 2MB
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPEG, PNG, JPG, or GIF images allowed`);
        return;
      }

      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File size must be less than 2MB`);
        return;
      }

      validFiles.push(file);
    });

    // Show validation errors if any
    if (errors.length > 0) {
      alert(errors.join('\n'));
      event.target.value = '';
      return;
    }

    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    // Reset upload success state for new files
    setUploadSuccessful(false);
    
    // Clear completion marker (local only)

    // Process valid files
    const newPreviewPromises = validFiles.map((file) => {
      return new Promise<{ file: File; preview: string; id: string }>((resolve) => {
        const reader = new FileReader();
        const fileId = generateFileId();
        
        reader.onloadend = () => {
          resolve({
            file,
            preview: reader.result as string,
            id: fileId
          });
        };
        
        reader.readAsDataURL(file);
      });
    });

    // Wait for all previews to be generated
    Promise.all(newPreviewPromises).then((newPreviews) => {
      // Add to existing previews (append mode)
      const updatedPreviews = [...previewImages, ...newPreviews];
      
      setPreviewImages(updatedPreviews);
      
      // Update preserved state with new previews
      preservedState.current = {
        previewImages: updatedPreviews,
        uploadSuccessful: false,
        timestamp: Date.now()
      };
      
      // No window state sync
    });

    // Clear input value for next selection
    event.target.value = '';
  };

  // Handle actual upload for multiple files
  const handleDeliveryProofUpload = async () => {
    if (previewImages.length === 0 || !card?.id) return;

    setUploadingProof(true);
    setUploadProgress({});
    
    try {
      const files = previewImages.map((p) => p.file);
      await uploadFiles(files);
      
      // Mark completion locally via state
      
      // Mark upload as successful
      setUploadSuccessful(true);
      
      // Update preserved state
      preservedState.current = {
        previewImages: [],
        uploadSuccessful: true,
        timestamp: Date.now()
      };
      
      // No window state to clear
      
      // Add to delivery proofs state and force refresh across all responsive modes
      // Force refresh delivery proofs to ensure consistency across responsive modes - SINGLE REFRESH ONLY
      setTimeout(() => {
        fetchDeliveryProofs(); // Simple fetch without force refresh to prevent loops
      }, 500);
      
      // Clear preview states
      setTimeout(() => {
        setPreviewImages([]);
        setUploadProgress({});
      }, 100);
      
      // Clear input
      const input = document.getElementById('delivery-proof-upload') as HTMLInputElement;
      if (input) input.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error uploading delivery proofs:", apiError);
      setUploadSuccessful(false);
      
      const errorMessage = apiError?.response?.data?.message || 'Failed to upload one or more delivery proofs';
      alert(errorMessage);
    } finally {
      setUploadingProof(false);
      setUploadProgress({});
    }
  };

  // Handle delivery proof deletion with improved error handling and sync
  const handleDeleteDeliveryProof = async (proofId: number) => {
    if (!card?.id) return;
    await deleteProof(proofId);
    if (selectedImage && selectedImage.includes(`delivery-proof/${proofId}`)) {
      setSelectedImage(null);
    }
  };

  // Handle cancel preview for specific image with proper state sync
  const handleCancelSinglePreview = (imageId: string) => {
    const updatedPreviews = previewImages.filter(img => img.id !== imageId);
    setPreviewImages(updatedPreviews);
    
    // Update preserved state
    preservedState.current = { 
      previewImages: updatedPreviews, 
      uploadSuccessful: false,
      timestamp: Date.now()
    };
    
    // No window state sync; local state only
  };

  // Handle cancel all previews with proper state cleanup
  const handleCancelAllPreviews = () => {
    const cancelTimestamp = Date.now();
    
    // Clear local state immediately
    setPreviewImages([]);
    setUploadSuccessful(false);
    setUploadProgress({});
    
    // Set cancelled state markers
    preservedState.current = { 
      previewImages: [], 
      uploadSuccessful: false,
      timestamp: cancelTimestamp,
      cancelled: true,
      cancelledTimestamp: cancelTimestamp
    };
    
    // No window state
    
    // Clear input values
    const input = document.getElementById('delivery-proof-upload') as HTMLInputElement;
    if (input) input.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Aggressive cleanup with multiple phases
    const cleanupPhases = [100, 300, 600, 1000, 1500];
    
    cleanupPhases.forEach((delay) => {
      setTimeout(() => {
        // Update preserved state again
        preservedState.current = { 
          previewImages: [], 
          uploadSuccessful: false,
          timestamp: cancelTimestamp,
          cancelled: true,
          cancelledTimestamp: cancelTimestamp
        };
        // Force re-render if components still have preview images
        setPreviewImages(current => current.length > 0 ? [] : current);
      }, delay);
    });
  };

  // Handle file select button click
  const handleFileSelectClick = () => {
    let input = fileInputRef.current;
    if (!input) {
      input = document.getElementById('delivery-proof-upload') as HTMLInputElement;
    }
    
    if (input) {
      try {
        input.click();
      } catch {
        try {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          input.dispatchEvent(clickEvent);
        } catch (fallbackError) {
          console.error("Failed to trigger file input:", fallbackError);
        }
      }
    }
  };

  // Show for data_input status
  if (currentStatus === "data_input") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {getStatusDisplayText(currentStatus)}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Action Required</h4>
            <p className="text-sm text-blue-700">
              Please confirm when you have sent your card to Grading Facility for grading.
            </p>
          </div>
          
          <button 
            onClick={() => handleUpdateSubmission("delivery_to_jp")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirm Sent to Grading Facility
          </button>
        </div>
      </div>
    );
  }

  // Show for payment_request status
  if (currentStatus === "payment_request") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {getStatusDisplayText(currentStatus)}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-900 mb-2">Payment Required</h4>
            <p className="text-sm text-green-700">
              Your card grading is complete! Please proceed with payment to continue with delivery.
            </p>
          </div>
          
          <div className="space-y-3">
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

            <button 
              onClick={() => handleUpdateSubmission("delivery_to_customer")}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Payment
            </button>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Instructions:</h5>
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

  // Show for received_by_customer status
  if (currentStatus === "received_by_customer") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {getStatusDisplayText(currentStatus)}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="text-sm font-medium text-orange-900 mb-2">Proof Required</h4>
            <p className="text-sm text-orange-700">
              Please upload photos as proof that you have received your graded card. You can select multiple images at once.
            </p>
          </div>
          
          <div className="space-y-4">
            {!uploadSuccessful && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Delivery Proof (Multiple Images Supported)
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={handleFileSelection}
                  disabled={uploadingProof}
                  multiple
                  className="hidden"
                  id="delivery-proof-upload"
                />
                
                <UploadDropzone uploading={uploadingProof} onClick={handleFileSelectClick} />

                {previewImages.length > 0 && !uploadSuccessful && (
                  <>
                    <PreviewGrid
                      previews={previewImages}
                      uploading={uploadingProof}
                      uploadProgress={uploadProgress}
                      onRemove={handleCancelSinglePreview}
                    />
                    <ActionButtons uploading={uploadingProof} count={previewImages.length} onUpload={handleDeliveryProofUpload} onCancelAll={handleCancelAllPreviews} />
                  </>
                )}
              </div>
            )}

            {uploadSuccessful && (
              <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="font-medium">Upload Successful!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your delivery proof images have been uploaded successfully. You can upload more images or complete your submission.
                </p>
              </div>
            )}

            {deliveryProofs.length > 0 && (
              <ProofsGrid
                proofs={deliveryProofs}
                deletingId={deletingId}
                onDelete={handleDeleteDeliveryProof}
                onPreview={(url) => setSelectedImage(url)}
              />
            )}

            {uploadSuccessful && (
              <button
                onClick={() => {
                  setUploadSuccessful(false);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add More Images
              </button>
            )}

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

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Instructions:</h5>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Click "Click to select images" to choose multiple photos at once</li>
                <li>2. Review the previews and remove any unwanted images by clicking the × button</li>
                <li>3. Click "Upload Images" to upload all selected photos</li>
                <li>4. Click "Add More Images" to upload additional photos if needed</li>
                <li>5. Click "Complete Submission" when all photos are uploaded</li>
              </ol>
            </div>
          </div>
        </div>

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

  return null;
}