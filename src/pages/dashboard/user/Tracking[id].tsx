import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
// import UserNotification from "../../../components/UserNotifications";
import axiosInstance from "../../../lib/axiosInstance";
import formatDate from "../../../utils/FormatDate";
import { ImHome } from "react-icons/im";
import { MdAssignmentAdd, MdTrackChanges } from "react-icons/md";
import Cookies from "js-cookie";
import { BE_URL } from "../../../lib/api";

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

type UserType = {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type StatusType = {
  id: number;
  card_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ImageType = {
  id: number;
  card_id: string;
  path: string;
  created_at: string;
  updated_at: string;
};

type CardDetailType = {
  id: string;
  user_id: number;
  name: string;
  year: number;
  brand: string;
  serial_number: string;
  latest_status: StatusType;
  grade_target: string;
  grade: string | null;
  created_at: string;
  updated_at: string;
  statuses: StatusType[];
  images: ImageType[];
};

export default function UserTrackingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [card, setCard] = useState<CardDetailType | undefined>(undefined);

  useEffect(() => {
    const initializeTrackingDetail = async () => {
      try {
        const token = Cookies.get("token");
        const role = Cookies.get("role");
        
        if (!token || role !== "user") {
          navigate("/signin", { replace: true });
          return;
        }

        if (!id) {
          navigate("/dashboard/user/tracking", { replace: true });
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

        // Get card detail - fixed: access .data property from response
        const cardResponse = await axiosInstance.get<CardDetailType>(`/user-cards/${id}`);
        // console.log(cardResponse.data)
        setCard(cardResponse.data);
        
      } catch (error) {
        console.error(error);
        // If card not found or access denied, redirect to tracking page
        navigate("/dashboard/user/tracking", { replace: true });
      }
    };
    
    initializeTrackingDetail();
  }, [id, navigate]);

  const getStatusBadge = (status: string, isCurrentStatus = false) => {
    const statusLower = status.toLowerCase();
    let badgeClass = "px-3 py-1 rounded-full text-sm font-medium ";
    
    switch (statusLower) {
      case 'submitted':
        badgeClass += isCurrentStatus ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600";
        break;
      case 'accepted':
        badgeClass += isCurrentStatus ? "bg-blue-200 text-blue-800" : "bg-blue-100 text-blue-600";
        break;
      case 'in process':
      case 'processing':
        badgeClass += isCurrentStatus ? "bg-yellow-200 text-yellow-800" : "bg-yellow-100 text-yellow-600";
        break;
      case 'done':
      case 'completed':
        badgeClass += isCurrentStatus ? "bg-green-200 text-green-800" : "bg-green-100 text-green-600";
        break;
      case 'rejected':
        badgeClass += isCurrentStatus ? "bg-red-200 text-red-800" : "bg-red-100 text-red-600";
        break;
      default:
        badgeClass += isCurrentStatus ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600";
    }
    
    return badgeClass;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center gap-4">
            <p className="text-xl font-medium text-gray-800">Card Details</p>
          </div>
          <div className="flex items-center gap-4">
            {/* <UserNotification /> */}
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        {/* Card Detail Content */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Card Information */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 lg:w-96 flex-shrink-0">
            <div className="flex items-start gap-2 mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">{card?.name}</h3>
              <span className="text-sm text-gray-500 mt-1">({card?.year})</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex">
                <span className="w-32 text-sm font-medium text-gray-600">Brand</span>
                <span className="text-sm text-gray-800">: {card?.brand}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-medium text-gray-600">Serial Number</span>
                <span className="text-sm text-gray-800">: {card?.serial_number}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-medium text-gray-600">Verified Grade</span>
                <span className="text-sm">
                  : {card?.grade ? (
                    <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {card.grade}
                    </span>
                  ) : (
                    <span className="text-gray-400 ml-1">-</span>
                  )}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-medium text-gray-600">Target Grade</span>
                <span className="text-sm text-gray-800">: {card?.grade_target}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-medium text-gray-600">Submitted At</span>
                <span className="text-sm text-gray-800">: {card?.created_at && formatDate(new Date(card.created_at))}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-sm font-medium text-gray-600">Status</span>
                <span className="text-sm">
                  : {card?.latest_status && (
                    <span className={`ml-1 ${getStatusBadge(card.latest_status.status, true)}`}>
                      {card.latest_status.status}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="flex-grow">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Status History</h4>
            <div className="relative">
              {card?.statuses?.map((status: StatusType, index: number) => (
                <div
                  key={status.id}
                  className="flex items-start pb-6 last:pb-0 relative"
                >
                  {/* Timeline line */}
                  {index < (card.statuses?.length || 0) - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                  )}
                  
                  {/* Timeline dot */}
                  <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  
                  {/* Status content */}
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={getStatusBadge(status.status)}>
                        {status.status}
                      </span>
                    </div>
                    {status.status.toLowerCase() === "done" && card.grade && (
                      <div className="mb-1">
                        <p className="text-sm text-green-600 mb-2">
                          Card is verified (grade: {card.grade})
                        </p>
                        <a
                          href="https://theospro.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Proceed to Payment
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      {formatDate(new Date(status.created_at))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Images */}
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-4">Card Pictures</h4>
          {card?.images && card.images.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {card.images.map((image: ImageType, index: number) => (
                <div
                  key={image.id}
                  className="bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 w-80 h-80"
                >
                  <img
                    src={`${BE_URL}/storage/${image.path}`}
                    alt={`Card image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No images available for this card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}