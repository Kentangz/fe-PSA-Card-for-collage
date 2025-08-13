import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
// import UserNotification from "../../../components/UserNotifications";
import axiosInstance from "../../../lib/axiosInstance";
import formatDate from "../../../utils/FormatDate";
import { Link } from "react-router-dom";
import { ImHome } from "react-icons/im";
import { MdAssignmentAdd, MdTrackChanges } from "react-icons/md";
import { BsEye } from "react-icons/bs";
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

const fields = [
  {
    label: "Name",
    name: "name",
  },
  {
    label: "Serial Number",
    name: "serial_number"
  },
  {
    label: "Verified Grade",
    name: "verified_grade"
  },
  {
    label: "Status",
    name: "status"
  },
  {
    label: "Submitted at",
    name: "submitted_at",
  },
];

type UserType = {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type CardType = {
  id: string;
  user_id: number;
  name: string;
  year: number;
  brand: string;
  serial_number: string;
  latest_status: { 
    id: number;
    card_id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  grade_target: string;
  grade: string | null;
  created_at: string;
  updated_at: string;
};

type CardsResponse = CardType[];

export default function UserTracking() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [cards, setCards] = useState<CardsResponse | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeTracking = async () => {
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

        // Get user cards
        const cardsResponse = await axiosInstance.get<CardsResponse>("/user-cards");
        setCards(cardsResponse.data);
        
      } catch (error) {
        console.error(error);
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/signin", { replace: true });
      }
    };
    
    initializeTracking();
  }, [navigate]);

  const getStatusStyle = (status: string) => {
    const normalizedStatus = status.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'submitted':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'on process':
      case 'processing':
      case 'in_process':
      case 'in process':
        return 'bg-blue-100 text-blue-800';
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        // Handle variations in status names
        if (normalizedStatus.includes('submit')) {
          return 'bg-orange-100 text-orange-800';
        } else if (normalizedStatus.includes('accept')) {
          return 'bg-yellow-100 text-yellow-800';
        } else if (normalizedStatus.includes('reject')) {
          return 'bg-red-100 text-red-800';
        } else if (normalizedStatus.includes('process')) {
          return 'bg-blue-100 text-blue-800';
        } else if (normalizedStatus.includes('done') || normalizedStatus.includes('complete')) {
          return 'bg-green-100 text-green-800';
        } else {
          return 'bg-gray-100 text-gray-800';
        }
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(status)}`}>
        {status}
      </span>
    );
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
              <span className="hidden sm:inline">Track Submission</span>
              <span className="sm:hidden">Track Submission</span>
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
          {cards && cards.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {fields.map(field => (
                          <th key={field.name} className="py-3 px-6 font-medium text-gray-700">
                            {field.label}
                          </th>
                        ))}
                        <th className="py-3 px-6 font-medium text-gray-700 text-center">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cards.map((card: CardType, index: number) => (
                        <tr key={card.id || index} className="hover:bg-gray-50">
                          <td className="py-3 px-6 whitespace-nowrap text-gray-800 font-medium">
                            {card.name}
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap text-gray-600">
                            {card.serial_number}
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap">
                            {card.grade ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                {card.grade}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap">
                            {getStatusBadge(card.latest_status?.status || 'Unknown')}
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap text-gray-600">
                            {formatDate(new Date(card.created_at))}
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap text-center">
                            <Link
                              to={`/dashboard/user/tracking/${card.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              title="View Details"
                            >
                              <BsEye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4">
                {cards.map((card: CardType, index: number) => (
                  <div key={card.id || index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                          {card.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {card.serial_number}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        {getStatusBadge(card.latest_status?.status || 'Unknown')}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Verified Grade</span>
                        {card.grade ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {card.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Submitted</span>
                        <span className="text-gray-800">
                          {formatDate(new Date(card.created_at))}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link
                        to={`/dashboard/user/tracking/${card.id}`}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        <BsEye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
              <div className="text-center max-w-md mx-auto">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <MdTrackChanges className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">No submissions to track</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">You haven't submitted any cards yet</p>
                <button
                  
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                >
                  Create First Submission
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}