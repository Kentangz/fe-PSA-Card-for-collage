import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
// import UserNotification from "../../../components/UserNotifications";
import SubmissionForm from "../../../components/SubmissionForm";
import axiosInstance from "../../../lib/axiosInstance";
import { ImHome } from "react-icons/im";
import { MdTrackChanges, MdArrowBack } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import Cookies from "js-cookie";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { BatchType } from "../../../types/submission";

const menu = [
  {
    title: "home",
    link: "/dashboard/user",
    icon: ImHome
  },
  {
    title: "track submission",
    link: "/dashboard/user/tracking",
    icon: MdTrackChanges
  },
];

export type SubmissionData = {
  name: string;
  year: string;
  brand: string;
  grade_target: string;
  images: File[];
};

type UserType = {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

const getCategoryStyling = (category: string) => {
  switch (category) {
    case 'PSA-Japan':
      return 'bg-slate-100 text-slate-700';
    case 'PSA-USA':
      return 'bg-gray-100 text-gray-700';
    case 'CGC':
      return 'bg-zinc-100 text-zinc-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BatchInfoSection = ({ batch, onBackToDashboard, isSubmitting }: { 
  batch: BatchType; 
  onBackToDashboard: () => void;
  isSubmitting: boolean;
}) => {
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const maxLength = 200;
  
  const shouldTruncateServices = batch.services.length > maxLength;
  const displayServices = shouldTruncateServices && !isServicesExpanded 
    ? batch.services.slice(0, maxLength) + '...' 
    : batch.services;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {batch.batch_number}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${getCategoryStyling(batch.category)}`}>
                  {batch.category}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Register Number:</span> {batch.register_number}</p>
                <div>
                  <p className="mb-1"><span className="font-medium">Services:</span></p>
                  <div className="text-sm leading-relaxed">
                    <p>{displayServices}</p>
                    {shouldTruncateServices && (
                      <button
                        onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                        className="mt-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        {isServicesExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onBackToDashboard}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-shrink-0"
            >
              <MdArrowBack className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserSubmissions() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [selectedBatch, setSelectedBatch] = useState<BatchType | undefined>(undefined);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([
    { name: "", year: "", brand: "", grade_target: "", images: [] },
  ]);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('batch_id');

  useEffect(() => {
    const initializeSubmissions = async () => {
      try {
        setLoading(true);
        setBatchLoading(true);
        
        const token = Cookies.get("token");
        const role = Cookies.get("role");
        
        if (!token || role !== "user") {
          navigate("/signin", { replace: true });
          return;
        }

        if (!batchId) {
          navigate("/dashboard/user", { replace: true });
          return;
        }

        // Get current user and batch details in parallel
        const [userResponse, batchResponse] = await Promise.all([
          axiosInstance.get<UserType>("/user"),
          axiosInstance.get<BatchType>(`/batches/${batchId}`)
        ]);
        
        if (!userResponse.data.is_active) {
          Cookies.remove("token");
          Cookies.remove("role");
          navigate("/signin", { replace: true });
          return;
        }

        if (userResponse.data.role === "admin") {
          navigate("/dashboard/admin", { replace: true });
          return;
        }

        // Check if batch is still active
        if (!batchResponse.data.is_active) {
          navigate("/dashboard/user", { replace: true });
          return;
        }

        setCurrentUser(userResponse.data);
        setSelectedBatch(batchResponse.data);
        
      } catch (error) {
        console.error(error);
        // If batch not found or any error, redirect to dashboard
        navigate("/dashboard/user", { replace: true });
      } finally {
        setLoading(false);
        setBatchLoading(false);
      }
    };
    
    initializeSubmissions();
  }, [navigate, batchId]);

  const addSubmission = () => {
    setSubmissions(prev => [...prev, { name: "", year: "", brand: "", grade_target: "", images: [] }]);
  };

  const removeSubmission = (index: number) => {
    if (submissions.length > 1) {
      setSubmissions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateForm = (index: number, data: SubmissionData) => {
    const updated = [...submissions];
    updated[index] = data;
    setSubmissions(updated);
  };

  const validateSubmissions = () => {
    for (const submission of submissions) {
      if (!submission.name || !submission.year || !submission.brand || 
          !submission.grade_target || submission.images.length === 0) {
        return false;
      }
    }
    return true;
  };

  const handleSubmitAll = async () => {
    if (!batchId || !selectedBatch) {
      setError(true);
      return;
    }

    if (!validateSubmissions()) {
      setError(true);
      return;
    }

    setError(false);
    setIsSubmitting(true);

    try {
      for (const submission of submissions) {
        const formData = new FormData();
        formData.append("name", submission.name);
        formData.append("year", submission.year);
        formData.append("brand", submission.brand);
        formData.append("grade_target", submission.grade_target);
        formData.append("batch_id", batchId);
        
        submission.images.forEach((file: File) => {
          formData.append("images[]", file);
        });

        await axiosInstance.post("/card", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Success - navigate to dashboard
      navigate("/dashboard/user");
      
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard/user");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar menu={menu} />
        
        {/* Navigation Bar Skeleton */}
        <nav className="w-full lg:pl-64 pl-4 mt-4">
          <div className="h-14 flex justify-between items-center px-2">
            <div className="flex items-center">
              <div className="w-10 lg:w-0"></div>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </nav>
        
        {/* Content Skeleton */}
        <div className="lg:pl-64 pl-4 pr-4 pb-4">
          <div className="mt-4 space-y-6">
            <div className="bg-gray-200 animate-pulse h-20 rounded-lg"></div>
            <div className="bg-gray-200 animate-pulse h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      {/* Navigation Bar - Responsive */}
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              <span className="hidden sm:inline">
                Create Submission{selectedBatch ? ` - ${selectedBatch.batch_number}` : ''}
              </span>
              <span className="sm:hidden">Create Submission</span>
            </p>
          </div>
          
          {/* Right side menu - responsive */}
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {/* <UserNotification /> */}
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="lg:pl-64 pl-4 pr-4 pb-4">
        <div className="mt-4 space-y-4 sm:space-y-6">
          
          {/* Batch Info Section */}
          {batchLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : selectedBatch && (
            <BatchInfoSection 
              batch={selectedBatch} 
              onBackToDashboard={handleBackToDashboard}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <button
              onClick={addSubmission}
              disabled={isSubmitting || !selectedBatch}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2.5 rounded-lg text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="sm:hidden">+ Add Submission</span>
              <span className="hidden sm:inline">Add More Submission</span>
            </button>
            
            {/* Submission counter - mobile only */}
            <div className="sm:hidden text-sm text-gray-600">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-red-800 text-sm font-medium">
                <span className="hidden sm:inline">Error: Please make sure all fields are filled and at least one image is uploaded for each submission.</span>
                <span className="sm:hidden">Please fill all fields and upload at least one image for each submission.</span>
              </p>
            </div>
          )}

          {/* No Batch Selected State */}
          {!selectedBatch && !batchLoading && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <HiOutlineClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2 text-sm sm:text-base">No batch selected</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Please select a batch from the dashboard to create submissions</p>
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Submissions Grid - Responsive */}
          {selectedBatch && !batchLoading && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {submissions.map((data, index) => (
                  <div key={index} className="relative">
                    {/* Remove button - responsive positioning */}
                    {submissions.length > 1 && (
                      <button
                        onClick={() => removeSubmission(index)}
                        disabled={isSubmitting}
                        className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ×
                      </button>
                    )}
                    <SubmissionForm
                      index={index}
                      data={data}
                      onChange={updateForm}
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  onClick={handleBackToDashboard}
                  disabled={isSubmitting}
                  className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAll}
                  disabled={isSubmitting || submissions.length === 0 || !selectedBatch}
                  className="order-1 sm:order-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  {isSubmitting ? (
                    <>
                      <span className="hidden sm:inline">Submitting to {selectedBatch?.batch_number}...</span>
                      <span className="sm:hidden">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Submit to {selectedBatch?.batch_number} ({submissions.length})</span>
                      <span className="sm:hidden">Submit All</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}