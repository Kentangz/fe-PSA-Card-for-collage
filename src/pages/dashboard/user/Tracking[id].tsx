import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import UserUpdateCard from "../../../components/UserUpdateCard";
import MobileTimeline from "../../../components/UserTimeline"; // NEW IMPORT
import axiosInstance from "../../../lib/axiosInstance";
import formatDate from "../../../utils/FormatDate";
import { ImHome } from "react-icons/im";
import { MdAssignmentAdd, MdTrackChanges } from "react-icons/md";
import { BsArrowLeft, BsImage } from "react-icons/bs";
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
  payment_url?: string | null;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

        const cardResponse = await axiosInstance.get<CardDetailType>(`/user-cards/${id}`);
        setCard(cardResponse.data);
        
      } catch (error) {
        console.error(error);
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
        badgeClass += isCurrentStatus ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-orange-50 text-orange-600";
        break;
      case 'accepted':
        badgeClass += isCurrentStatus ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-yellow-50 text-yellow-600";
        break;
      case 'in process':
      case 'processing':
        badgeClass += isCurrentStatus ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-blue-50 text-blue-600";
        break;
      case 'done':
      case 'completed':
        badgeClass += isCurrentStatus ? "bg-green-100 text-green-800 border-green-200" : "bg-green-50 text-green-600";
        break;
      case 'rejected':
        badgeClass += isCurrentStatus ? "bg-red-100 text-red-800 border-red-200" : "bg-red-50 text-red-600";
        break;
      default:
        badgeClass += isCurrentStatus ? "bg-gray-100 text-gray-800 border-gray-200" : "bg-gray-50 text-gray-600";
    }
    
    if (isCurrentStatus) {
      badgeClass += " border";
    }
    
    return badgeClass;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      {/* Navigation Bar */}
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 lg:w-0"></div>
            <Link 
              to="/dashboard/user/tracking"
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BsArrowLeft className="h-5 w-5" />
            </Link>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              <span className="hidden lg:inline">Card Details</span>
              <span className="lg:hidden">Details</span>
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="lg:pl-64 pl-4 pr-4 pb-4">
        <div className="mt-4">
          {/* Breadcrumb - Desktop Only */}
          <div className="hidden lg:flex mb-4 text-sm text-gray-500">
            <Link to="/dashboard/user/tracking" className="hover:text-gray-700 transition-colors">
              Track Submission
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Details</span>
          </div>

          {card ? (
            <div className="space-y-6">
              {/* Mobile Card Info */}
              <div className="block lg:hidden">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">{card.name}</h1>
                      <p className="text-sm text-gray-600">{card.brand} • {card.year}</p>
                    </div>
                    <span className={getStatusBadge(card.latest_status.status, true)}>
                      {card.latest_status.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serial Number:</span>
                      <span className="text-gray-900 font-medium">{card.serial_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Grade:</span>
                      <span className="text-gray-900 font-medium">{card.grade_target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified Grade:</span>
                      <span className="text-gray-900 font-medium">
                        {card.grade ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {card.grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="text-gray-900 font-medium">{formatDate(new Date(card.created_at))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile User Action Card */}
              <div className="block lg:hidden">
                <UserUpdateCard card={card} />
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex lg:gap-8">
                {/* Card Information */}
                <div className="w-96 bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex-shrink-0">
                  <div className="flex items-start gap-2 mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">{card.name}</h3>
                    <span className="text-sm text-gray-500 mt-1">({card.year})</span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex">
                      <span className="w-32 text-sm font-medium text-gray-600">Submitted At</span>
                      <span className="text-sm text-gray-800">: {formatDate(new Date(card.created_at))}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-sm font-medium text-gray-600">Status</span>
                      <span className="text-sm">
                        : <span className={`ml-1 ${getStatusBadge(card.latest_status.status, true)}`}>
                            {card.latest_status.status}
                          </span>
                      </span>
                    </div>
                  </div>

                  {/* Card Images inside Card Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BsImage className="h-4 w-4 text-gray-600" />
                      <h5 className="text-sm font-medium text-gray-800">Card Pictures</h5>
                    </div>
                    {card.images && card.images.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {card.images.map((image: ImageType, index: number) => (
                          <div
                            key={image.id}
                            className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <img
                              src={`${BE_URL}/storage/${image.path}`}
                              alt={`Card image ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => setSelectedImage(`${BE_URL}/storage/${image.path}`)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <BsImage className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-xs">No images available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* REPLACED: Mobile Timeline for Desktop */}
                <div className="flex-grow">
                  <MobileTimeline 
                    statuses={card.statuses}
                    currentStatus={card.latest_status.status}
                    grade={card.grade}
                  />
                </div>

                {/* Desktop User Action Card */}
                <div className="w-80">
                  <UserUpdateCard card={card} />
                </div>
              </div>

              {/* REPLACED: Mobile Timeline */}
              <div className="block lg:hidden">
                <MobileTimeline 
                  statuses={card.statuses}
                  currentStatus={card.latest_status.status}
                  grade={card.grade}
                />
              </div>

              {/* Card Images - Mobile Only */}
              <div className="block lg:hidden bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BsImage className="h-5 w-5 text-gray-600" />
                  <h4 className="text-lg font-medium text-gray-800">Card Pictures</h4>
                </div>
                {card.images && card.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {card.images.map((image: ImageType, index: number) => (
                      <div
                        key={image.id}
                        className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={`${BE_URL}/storage/${image.path}`}
                          alt={`Card image ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => setSelectedImage(`${BE_URL}/storage/${image.path}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BsImage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No images available for this card</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          )}

          {/* Image Modal */}
          {selectedImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="max-w-4xl max-h-full">
                <img 
                  src={selectedImage} 
                  alt="Card full size"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}