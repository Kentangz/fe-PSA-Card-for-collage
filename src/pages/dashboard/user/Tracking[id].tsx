import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import UserUpdateCard from "../../../components/UserUpdateCard";
import MobileTimeline from "../../../components/UserTimeline"; // NEW IMPORT
import axiosInstance from "../../../lib/axiosInstance";
import formatDate from "../../../utils/FormatDate";
import { ImHome } from "react-icons/im";
import { MdTrackChanges } from "react-icons/md";
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

type Batch = {
  id: string | number;
  batch_number: string;
  register_number: string;
  services: string;
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  batch?: Batch;
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

  const getStatusStyle = (status: string) => {
    const normalizedStatus = status.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'submitted':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on process':
      case 'processing':
      case 'in_process':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBatchCategoryStyle = (category: string) => {
    switch (category) {
      case 'PSA-Japan':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PSA-USA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CGC':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(card.latest_status.status)}`}>
                      {card.latest_status.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span className="text-gray-900 font-medium">{card.brand}</span>
                    </div>
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
                      <span className="text-gray-900 font-medium">{card.grade ?? "Pending"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="text-gray-900 font-medium">{formatDate(new Date(card.created_at))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(card.latest_status.status)}`}>
                        {card.latest_status.status}
                      </span>
                    </div>
                    {/* Batch Information - Mobile */}
                    {card.batch && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batch:</span>
                          <span className="text-gray-900 font-medium">{card.batch.batch_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Register Number:</span>
                          <span className="text-gray-900 font-medium">{card.batch.register_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Category:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getBatchCategoryStyle(card.batch.category)}`}>
                            {card.batch.category}
                          </span>
                        </div>
                      </>
                    )}
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
                <div className="w-96 bg-white border border-gray-200 p-6 rounded-lg shadow-sm h-fit">
                  <div className="flex items-center gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">{card.name}</h1>
                    <span className="text-sm text-gray-600">({card.year})</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Brand:</span>
                      <span className="text-gray-900">{card.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Serial Number:</span>
                      <span className="text-gray-900">{card.serial_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Verified Grade:</span>
                      <span className="text-gray-900">{card.grade ?? "Pending"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Target Grade:</span>
                      <span className="text-gray-900">{card.grade_target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Submitted:</span>
                      <span className="text-gray-900">{formatDate(new Date(card.created_at))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(card.latest_status.status)}`}>
                        {card.latest_status.status}
                      </span>
                    </div>
                    {/* Batch Information - Desktop */}
                    {card.batch && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Batch:</span>
                          <span className="text-gray-900">{card.batch.batch_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Register Number:</span>
                          <span className="text-gray-900">{card.batch.register_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Category:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getBatchCategoryStyle(card.batch.category)}`}>
                            {card.batch.category}
                          </span>
                        </div>
                      </>
                    )}
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
                <div className="flex-1">
                  <MobileTimeline 
                    statuses={card.statuses}
                    currentStatus={card.latest_status.status}
                    grade={card.grade}
                    cardId={card.id}
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
                  cardId={card.id}
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