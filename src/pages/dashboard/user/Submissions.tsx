import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
// import UserNotification from "../../../components/UserNotifications";
import SubmissionForm from "../../../components/SubmissionForm";
import axiosInstance from "../../../lib/axiosInstance";
import { ImHome } from "react-icons/im";
import { MdAssignmentAdd, MdTrackChanges } from "react-icons/md";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const menu = [
  {
    title: "home",
    link: "/dashboard/user",
    icon: ImHome
  },
  {
    title: "create submission",
    link: "/dashboard/user/submissions",
    icon: MdAssignmentAdd
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

export default function UserSubmissions() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([
    { name: "", year: "", brand: "", grade_target: "", images: [] },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeSubmissions = async () => {
      try {
        const token = Cookies.get("token");
        const role = Cookies.get("role");
        
        if (!token || role !== "user") {
          navigate("/signin", { replace: true });
          return;
        }

        // Get current user
        const userResponse = await axiosInstance.get<UserType>("/user");
        
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

        setCurrentUser(userResponse.data);
        
      } catch (error) {
        console.error(error);
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/signin", { replace: true });
      }
    };
    
    initializeSubmissions();
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      {/* Navigation Bar - Responsive */}
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              <span className="hidden sm:inline">Create Submission</span>
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
          {/* Action Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <button
              onClick={addSubmission}
              disabled={isSubmitting}
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

          {/* Submissions Grid - Responsive */}
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
              onClick={() => navigate("/dashboard/user")}
              disabled={isSubmitting}
              className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting || submissions.length === 0}
              className="order-1 sm:order-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {isSubmitting ? (
                <>
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">Submitting...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Submit All ({submissions.length})</span>
                  <span className="sm:hidden">Submit All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}