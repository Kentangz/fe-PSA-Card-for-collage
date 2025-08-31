import axiosInstance from "../lib/axiosInstance";
import { useState, useEffect, useCallback, useRef } from "react";
import { BE_URL } from "../lib/api";
// Import from statusUtils
import { getStatusDisplayText } from "../utils/statusUtils";

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

// Define window upload state types for multiple files
interface WindowUploadState {
  previewImages: { file: File; preview: string; id: string }[];
  timestamp: number;
  uploadSuccessful: boolean;
  expired?: boolean;
  cancelledTimestamp?: number; // Add cancelled timestamp
}

interface WindowUploadCompleted {
  cardId: string | number;
  timestamp: number;
}

interface WindowCancelledState {
  cardId: string | number;
  timestamp: number;
}

// Add global delivery proofs state for cross-responsive sync
interface WindowDeliveryProofsState {
  cardId: string | number;
  proofs: DeliveryProof[];
  timestamp: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    __UPLOAD_STATE?: WindowUploadState;
    __UPLOAD_COMPLETED?: WindowUploadCompleted;
    __UPLOAD_CANCELLED?: WindowCancelledState; // Add cancelled state
    __DELIVERY_PROOFS?: WindowDeliveryProofsState; // Add delivery proofs sync
  }
}

export default function UserUpdateCard({ card }: { card?: CardType }) {
  const [uploadingProof, setUploadingProof] = useState(false);
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string; id: string }[]>([]);
  const [deletingProofId, setDeletingProofId] = useState<number | null>(null);
  const [uploadSuccessful, setUploadSuccessful] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current status early
  const currentStatus = card?.latest_status.status;
  
  // Fetch existing delivery proofs with better error handling and sync
  const fetchDeliveryProofs = useCallback(async (forceRefresh = false) => {
    if (!card?.id) return;
    
    try {
      const response = await axiosInstance.get<DeliveryProofResponse>(`/card/${card.id}/delivery-proof`);
      const newProofs = response.data.delivery_proofs || [];
      
      setDeliveryProofs(newProofs);
      
      // Update global delivery proofs state for cross-responsive sync
      window.__DELIVERY_PROOFS = {
        cardId: card.id,
        proofs: newProofs,
        timestamp: Date.now()
      };
      
      // If this is a forced refresh, trigger update in other responsive modes
      if (forceRefresh) {
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('deliveryProofsUpdated', {
          detail: { cardId: card.id, proofs: newProofs }
        }));
      }
      
    } catch (error) {
      console.error("Error fetching delivery proofs:", error);
      setDeliveryProofs([]);
      
      // Clear global state on error
      if (window.__DELIVERY_PROOFS && window.__DELIVERY_PROOFS.cardId === card.id) {
        delete window.__DELIVERY_PROOFS;
      }
    }
  }, [card?.id]);
  
  // Add event listener for cross-responsive delivery proofs sync
  useEffect(() => {
    const handleDeliveryProofsUpdate = (event: CustomEvent) => {
      const { cardId, proofs } = event.detail;
      if (cardId === card?.id) {
        setDeliveryProofs(proofs);
      }
    };
    
    window.addEventListener('deliveryProofsUpdated', handleDeliveryProofsUpdate as EventListener);
    return () => {
      window.removeEventListener('deliveryProofsUpdated', handleDeliveryProofsUpdate as EventListener);
    };
  }, [card?.id]);
  
  // Sync delivery proofs across responsive modes - FIXED WITH useRef TO AVOID DEPENDENCY ISSUES
  const prevDeliveryProofsRef = useRef<DeliveryProof[]>([]);
  
  useEffect(() => {
    const globalProofs = window.__DELIVERY_PROOFS;
    if (globalProofs && 
        globalProofs.cardId === card?.id && 
        globalProofs.timestamp > (Date.now() - 30000) && // Within last 30 seconds
        JSON.stringify(prevDeliveryProofsRef.current) !== JSON.stringify(globalProofs.proofs)) {
      setDeliveryProofs(globalProofs.proofs);
      prevDeliveryProofsRef.current = globalProofs.proofs;
    }
  }, [card?.id]);
  
  // Update ref when deliveryProofs changes
  useEffect(() => {
    prevDeliveryProofsRef.current = deliveryProofs;
  }, [deliveryProofs]);
  
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
  
  // Debug effect for state changes - updated for multiple images
  useEffect(() => {
    if (!uploadSuccessful) {
      preservedState.current = {
        previewImages,
        uploadSuccessful,
        timestamp: Date.now()
      };
      
      if (previewImages.length > 0) {
        window.__UPLOAD_STATE = {
          previewImages,
          timestamp: Date.now(),
          uploadSuccessful
        };
      }
    } else {
      preservedState.current = {
        previewImages: [],
        uploadSuccessful: true,
        timestamp: Date.now()
      };
      
      if (window.__UPLOAD_STATE) {
        window.__UPLOAD_STATE = {
          uploadSuccessful: true,
          timestamp: Date.now(),
          expired: true,
          previewImages: []
        };
        
        setTimeout(() => {
          delete window.__UPLOAD_STATE;
        }, 1000);
      }
      
      window.__UPLOAD_COMPLETED = {
        cardId: card?.id || '',
        timestamp: Date.now()
      };
    }
  }, [previewImages, uploadSuccessful, card?.id]);
  
  // Restore state on component mount - updated for multiple images
  useEffect(() => {
    const uploadCompleted = window.__UPLOAD_COMPLETED;
    if (uploadCompleted && uploadCompleted.cardId === card?.id) {
      setUploadSuccessful(true);
      return;
    }
    
    const savedState = window.__UPLOAD_STATE;
    if (savedState && 
        !savedState.expired &&
        savedState.timestamp > (Date.now() - 30000) && 
        !savedState.uploadSuccessful) {
      setPreviewImages(savedState.previewImages);
      setUploadSuccessful(false);
    } else if (savedState && (savedState.uploadSuccessful || savedState.expired)) {
      delete window.__UPLOAD_STATE;
      setUploadSuccessful(true);
    }
  }, [card?.id]);
  
  // Window resize handler - PROPERLY FIXED WITH useCallback TO AVOID DEPENDENCY ISSUES
  const handleResize = useCallback(() => {
    // Check for cancelled state first - this takes priority
    const cancelledState = window.__UPLOAD_CANCELLED;
    if (cancelledState && cancelledState.cardId === card?.id) {
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      if (uploadSuccessful) {
        setUploadSuccessful(false);
      }
      return; // Exit early, don't restore anything
    }
    
    // Always check upload completed 
    const uploadCompleted = window.__UPLOAD_COMPLETED;
    if (uploadCompleted && uploadCompleted.cardId === card?.id) {
      if (!uploadSuccessful) {
        setUploadSuccessful(true);
      }
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      return;
    }
    
    // Check if preserved state was recently cancelled
    if (preservedState.current.cancelled && 
        preservedState.current.cancelledTimestamp &&
        (Date.now() - preservedState.current.cancelledTimestamp) < 2000) {
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      return; // Don't restore cancelled state
    }
    
    // Check window state and sync with current state
    const windowState = window.__UPLOAD_STATE;
    
    // If window state is expired or has cancel timestamp, ignore it completely
    if (windowState && (windowState.expired || windowState.cancelledTimestamp)) {
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      delete window.__UPLOAD_STATE;
      return;
    }
    
    if (windowState && !windowState.expired) {
      // If window has upload success but local doesn't
      if (windowState.uploadSuccessful && !uploadSuccessful) {
        setUploadSuccessful(true);
        setPreviewImages([]);
        return;
      }
      
      // If window has preview images but local doesn't or different length
      if (!windowState.uploadSuccessful && 
          windowState.previewImages.length > 0 && 
          (previewImages.length === 0 || previewImages.length !== windowState.previewImages.length)) {
        setPreviewImages(windowState.previewImages);
        if (uploadSuccessful) {
          setUploadSuccessful(false);
        }
        return;
      }
      
      // If local has preview images but window doesn't or different length
      if (!windowState.uploadSuccessful && 
          previewImages.length > 0 && 
          (windowState.previewImages.length === 0 || previewImages.length !== windowState.previewImages.length)) {
        window.__UPLOAD_STATE = {
          previewImages,
          timestamp: Date.now(),
          uploadSuccessful: false
        };
        return;
      }
    }
    
    // If no window state, check preserved state but NEVER restore cancelled state
    if (!windowState && 
        preservedState.current.previewImages.length > 0 && 
        !preservedState.current.uploadSuccessful &&
        !preservedState.current.cancelled && // Never restore cancelled state
        previewImages.length === 0 && 
        !uploadSuccessful &&
        (Date.now() - preservedState.current.timestamp) > 1000) { // Only restore if more than 1 second old
      setPreviewImages(preservedState.current.previewImages);
      
      window.__UPLOAD_STATE = {
        previewImages: preservedState.current.previewImages,
        timestamp: Date.now(),
        uploadSuccessful: false
      };
    }
  }, [previewImages, uploadSuccessful, card?.id]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  // Interval recovery - PROPERLY FIXED WITH useCallback TO AVOID DEPENDENCY ISSUES
  const checkInterval = useCallback(() => {
    // Check for cancelled state first - this takes priority
    const cancelledState = window.__UPLOAD_CANCELLED;
    if (cancelledState && cancelledState.cardId === card?.id) {
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      if (uploadSuccessful) {
        setUploadSuccessful(false);
      }
      return; // Exit early, don't restore anything
    }
    
    // Always check upload completed 
    const uploadCompleted = window.__UPLOAD_COMPLETED;
    if (uploadCompleted && uploadCompleted.cardId === card?.id) {
      if (!uploadSuccessful) {
        setUploadSuccessful(true);
      }
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      return;
    }
    
    // Check if preserved state was recently cancelled
    if (preservedState.current.cancelled && 
        preservedState.current.cancelledTimestamp &&
        (Date.now() - preservedState.current.cancelledTimestamp) < 2000) {
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      return; // Don't restore cancelled state
    }
    
    // Check window state synchronization
    const windowState = window.__UPLOAD_STATE;
    
    // If window state is expired or cancelled, clear everything
    if (windowState && (windowState.expired || windowState.cancelledTimestamp)) {
      if (previewImages.length > 0) {
        setPreviewImages([]);
      }
      delete window.__UPLOAD_STATE;
      return;
    }
    
    if (windowState && !windowState.expired) {
      // Sync upload success state
      if (windowState.uploadSuccessful && !uploadSuccessful) {
        setUploadSuccessful(true);
        setPreviewImages([]);
        return;
      }
      
      // Sync preview images state
      if (!windowState.uploadSuccessful && 
          windowState.previewImages.length > 0 && 
          (previewImages.length !== windowState.previewImages.length)) {
        setPreviewImages(windowState.previewImages);
        if (uploadSuccessful) {
          setUploadSuccessful(false);
        }
        return;
      }
      
      // Update window state if local state is more recent
      if (!windowState.uploadSuccessful &&
          previewImages.length > 0 &&
          (windowState.previewImages.length !== previewImages.length)) {
        window.__UPLOAD_STATE = {
          previewImages,
          timestamp: Date.now(),
          uploadSuccessful: false
        };
        return;
      }
    }
    
    // If no window state but preserved state exists, NEVER restore cancelled state
    if (!windowState && 
        preservedState.current.previewImages.length > 0 && 
        !preservedState.current.uploadSuccessful &&
        !preservedState.current.cancelled && // Never restore cancelled state
        previewImages.length === 0 && 
        !uploadSuccessful &&
        (Date.now() - preservedState.current.timestamp) > 1000) { // Only restore if more than 1 second old
      setPreviewImages(preservedState.current.previewImages);
      
      window.__UPLOAD_STATE = {
        previewImages: preservedState.current.previewImages,
        timestamp: Date.now(),
        uploadSuccessful: false
      };
    }
  }, [previewImages, uploadSuccessful, card?.id]); // REMOVED currentStatus as it's not used

  useEffect(() => {
    const interval = setInterval(checkInterval, 300); // More frequent checking for better responsiveness
    return () => clearInterval(interval);
  }, [checkInterval]);

  useEffect(() => {
    if (currentStatus === "received_by_customer") {
      fetchDeliveryProofs();
    }
  }, [currentStatus, fetchDeliveryProofs]);

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
    
    // Clear completion marker for new upload
    if (window.__UPLOAD_COMPLETED) {
      delete window.__UPLOAD_COMPLETED;
    }

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
      
      // Update window state for new upload
      window.__UPLOAD_STATE = {
        previewImages: updatedPreviews,
        timestamp: Date.now(),
        uploadSuccessful: false
      };
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
      const uploadPromises = previewImages.map(async (imageData) => {
        const formData = new FormData();
        formData.append('image', imageData.file);

        // Update progress for this specific file
        setUploadProgress(prev => ({
          ...prev,
          [imageData.id]: 0
        }));

        try {
          const response = await axiosInstance.post<UploadResponse>(`/card/${card.id}/delivery-proof`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });

          if (response.data.success) {
            // Create new proof object
            const newProof: DeliveryProof = {
              id: response.data.data.id,
              card_id: response.data.data.card_id,
              image_path: response.data.data.image_path,
              created_at: response.data.data.created_at,
              updated_at: response.data.data.created_at
            };
            
            return newProof;
          } else {
            throw new Error(response.data.message || 'Upload failed');
          }
        } catch (error) {
          console.error(`Error uploading file ${imageData.file.name}:`, error);
          throw error;
        }
      });

      // Wait for all uploads to complete
      const newProofs = await Promise.all(uploadPromises);
      
      // Set permanent completion marker
      window.__UPLOAD_COMPLETED = {
        cardId: card?.id,
        timestamp: Date.now()
      };
      
      // Mark upload as successful
      setUploadSuccessful(true);
      
      // Update preserved state
      preservedState.current = {
        previewImages: [],
        uploadSuccessful: true,
        timestamp: Date.now()
      };
      
      // Clear window state
      if (window.__UPLOAD_STATE) {
        window.__UPLOAD_STATE = {
          uploadSuccessful: true,
          timestamp: Date.now(),
          expired: true,
          previewImages: []
        };
        
        setTimeout(() => {
          delete window.__UPLOAD_STATE;
        }, 500);
      }
      
      // Add to delivery proofs state and force refresh across all responsive modes
      const updatedProofs = [...deliveryProofs, ...newProofs];
      setDeliveryProofs(updatedProofs);
      
      // Update global delivery proofs state for cross-responsive sync
      window.__DELIVERY_PROOFS = {
        cardId: card?.id,
        proofs: updatedProofs,
        timestamp: Date.now()
      };
      
      // Notify other responsive modes
      window.dispatchEvent(new CustomEvent('deliveryProofsUpdated', {
        detail: { cardId: card?.id, proofs: updatedProofs }
      }));
      
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

    // Check if the proof still exists in current state
    const proofExists = deliveryProofs.some(proof => proof.id === proofId);
    if (!proofExists) {
      await fetchDeliveryProofs(true); // Force refresh with sync
      return;
    }

    setDeletingProofId(proofId);
    
    try {
      const response = await axiosInstance.delete(`/card/${card.id}/delivery-proof/${proofId}`);
      
      if (response.status === 200) {
        // Update local state immediately
        const updatedProofs = deliveryProofs.filter(proof => proof.id !== proofId);
        setDeliveryProofs(updatedProofs);
        
        // Update global delivery proofs state for cross-responsive sync
        window.__DELIVERY_PROOFS = {
          cardId: card.id,
          proofs: updatedProofs,
          timestamp: Date.now()
        };
        
        // Notify other responsive modes immediately
        window.dispatchEvent(new CustomEvent('deliveryProofsUpdated', {
          detail: { cardId: card.id, proofs: updatedProofs }
        }));
        
        // Close modal if this image was selected
        if (selectedImage && selectedImage.includes(`delivery-proof/${proofId}`)) {
          setSelectedImage(null);
        }
        
        // Force refresh to ensure consistency
        setTimeout(() => {
          fetchDeliveryProofs(true); // Force refresh with sync
        }, 100);
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error deleting delivery proof:", apiError);
      
      // Check if it's a 404 error (image already deleted)
      if (apiError?.response?.status === 404) {
        await fetchDeliveryProofs(true); // Force refresh with sync
        
        // Close modal if this image was selected
        if (selectedImage && selectedImage.includes(`delivery-proof/${proofId}`)) {
          setSelectedImage(null);
        }
      } else {
        const errorMessage = apiError?.response?.data?.message || 'Failed to delete delivery proof';
        alert(errorMessage);
      }
    } finally {
      setDeletingProofId(null);
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
    
    // Update or delete window state based on remaining images
    if (updatedPreviews.length > 0) {
      window.__UPLOAD_STATE = {
        previewImages: updatedPreviews,
        timestamp: Date.now(),
        uploadSuccessful: false
      };
    } else {
      delete window.__UPLOAD_STATE;
      // Force cleanup after small delay
      setTimeout(() => {
        if (window.__UPLOAD_STATE) {
          delete window.__UPLOAD_STATE;
        }
      }, 100);
    }
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
    
    // Set global cancel marker
    window.__UPLOAD_CANCELLED = {
      cardId: card?.id || '',
      timestamp: cancelTimestamp
    };
    
    // Completely remove window state
    delete window.__UPLOAD_STATE;
    
    // Clear input values
    const input = document.getElementById('delivery-proof-upload') as HTMLInputElement;
    if (input) input.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Aggressive cleanup with multiple phases
    const cleanupPhases = [100, 300, 600, 1000, 1500];
    
    cleanupPhases.forEach((delay) => {
      setTimeout(() => {
        // Clear all possible state remnants
        delete window.__UPLOAD_STATE;
        
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
        
        // Keep cancel marker alive
        if (!window.__UPLOAD_CANCELLED || window.__UPLOAD_CANCELLED.timestamp < cancelTimestamp) {
          window.__UPLOAD_CANCELLED = {
            cardId: card?.id || '',
            timestamp: cancelTimestamp
          };
        }
      }, delay);
    });
    
    // Final cleanup after 3 seconds to remove cancel marker
    setTimeout(() => {
      if (window.__UPLOAD_CANCELLED && window.__UPLOAD_CANCELLED.timestamp === cancelTimestamp) {
        delete window.__UPLOAD_CANCELLED;
      }
    }, 3000);
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
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <button
                    type="button"
                    onClick={handleFileSelectClick}
                    disabled={uploadingProof}
                    className={`w-full cursor-pointer flex flex-col items-center justify-center ${
                      uploadingProof ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    } rounded-lg p-4 transition-colors border-none bg-transparent`}
                  >
                    {uploadingProof ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading {previewImages.length} image(s)...</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-sm text-gray-600">Click to select images (Multiple supported)</p>
                        <p className="text-xs text-gray-500 mt-1">Max 2MB per image • JPEG, PNG, JPG, GIF</p>
                        {previewImages.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            {previewImages.length} image(s) selected • Click to add more
                          </p>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {previewImages.length > 0 && !uploadSuccessful && (
                  <div className="mt-3 space-y-3 border-2 border-green-500 p-4 rounded-lg bg-green-50">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium text-green-900">
                        Selected Images ({previewImages.length})
                      </h5>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {previewImages.map((imageData) => (
                        <div key={imageData.id} className="relative group">
                          <img 
                            src={imageData.preview} 
                            alt={`Preview ${imageData.file.name}`}
                            className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                          />
                          
                          {/* Upload progress bar */}
                          {uploadingProof && uploadProgress[imageData.id] !== undefined && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                              <div className="text-white text-xs">
                                {uploadProgress[imageData.id]}%
                              </div>
                            </div>
                          )}
                          
                          {/* Remove button */}
                          <button
                            onClick={() => handleCancelSinglePreview(imageData.id)}
                            disabled={uploadingProof}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove image"
                          >
                            ×
                          </button>
                          
                          {/* File name */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                            {imageData.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                      <button
                        onClick={handleDeliveryProofUpload}
                        disabled={uploadingProof}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        {uploadingProof ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Uploading {previewImages.length} image(s)...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload {previewImages.length} Image(s)
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleCancelAllPreviews}
                        disabled={uploadingProof}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        Cancel All
                      </button>
                    </div>
                  </div>
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
                      
                      <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                        ✓
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadSuccessful && (
              <button
                onClick={() => {
                  delete window.__UPLOAD_COMPLETED;
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