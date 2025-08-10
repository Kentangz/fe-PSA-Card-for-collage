import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import UserNotification from "../../../components/UserNotifications";
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
  serial_number: string;
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
    { name: "", year: "", brand: "", serial_number: "", grade_target: "", images: [] },
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
    setSubmissions(prev => [...prev, { name: "", year: "", brand: "", serial_number: "", grade_target: "", images: [] }]);
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
          !submission.serial_number || !submission.grade_target || 
          submission.images.length === 0) {
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
        formData.append("serial_number", submission.serial_number);
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
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800">Create Submission</p>
          <div className="flex items-center gap-4">
            <UserNotification />
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        {/* Submissions Content */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={addSubmission}
              disabled={isSubmitting}
              className="bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add More Submission
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm font-medium">
                Error: Please make sure all fields are filled and at least one image is uploaded for each submission.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {submissions.map((data, index) => (
              <div key={index} className="relative">
                {submissions.length > 1 && (
                  <button
                    onClick={() => removeSubmission(index)}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 z-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/dashboard/user")}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting || submissions.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {isSubmitting ? "Submitting..." : "Submit All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}