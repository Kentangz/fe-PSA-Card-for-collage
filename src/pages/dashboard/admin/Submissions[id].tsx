import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BsPeopleFill, BsArrowLeft, BsImage, BsPencil, BsCheck, BsX } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "@/components/SideBar";
import ProfileMenu from "@/components/ProfileMenu";
import UpdateCard from "@/components/UpdateCard";
import EnhancedTimeline from "@/components/AdminTimeline";
import { useDeliveryProofs } from "@/hooks/useDeliveryProofs";
import axiosInstance from "@/lib/axiosInstance";
import { BE_URL} from "@/lib/api";
import formatDate from "@/utils/formatDate";
// Cookies handled in hook
import StatusBadge from "@/components/StatusBadge";
import { useAdminSubmissionDetail } from "@/hooks/useAdminSubmissionDetail";

// Import types from centralized location
import type { CardStatus, CardImage } from "@/types/card.types";

interface Batch {
  id: string | number;
  batch_number: string;
  register_number: string;
  services: string;
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CardType {
  id: string | number;
  user_id: number;
  name: string;
  year: string;
  brand: string;
  serial_number: string;
  grade: string | null;
  payment_url?: string | null;
  created_at: string;
  images: CardImage[];
  statuses: CardStatus[];
  latest_status: CardStatus;
  batch?: Batch;
}

// CardResponse handled in hook types

// API response shape handled in hook

// User type handled in hook

// Menu configuration
const menu = [
  {
    title: "home",
    link: "/dashboard/admin",
    icon: ImHome
  },
  {
    title: "users",
    link: "/dashboard/admin/users",
    icon: BsPeopleFill
  },
  {
    title: "submissions",
    link: "/dashboard/admin/submissions",
    icon: MdAssignment
  }
];

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

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, card, loading, error, setCard, refresh } = useAdminSubmissionDetail(id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { deliveryProofs, uploading } = useDeliveryProofs(card?.id);
  
  // Edit name states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  
  // navigate not used directly here

  const refreshCard = () => { refresh(); };

  // Function to handle name update
  const handleUpdateName = async () => {
    if (!card || !editedName.trim()) return;
    
    try {
      setIsUpdatingName(true);
      await axiosInstance.put(`/card/${card.id}`, {
        name: editedName.trim()
      });
      
      // Update local card state
      if (card) {
        setCard({
          ...card,
          name: editedName.trim()
        });
      }
      
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating card name:', error);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(card?.name || "");
    setIsEditingName(false);
  };

  const handleStartEdit = () => {
    setEditedName(card?.name || "");
    setIsEditingName(true);
  };

  // Data fetching and auth handled in hook

  // EditableCardName Component
  const EditableCardName = ({ 
    name, 
    onEdit, 
    className = "",
    isMobile = false
  }: { 
    name: string; 
    onEdit: () => void; 
    className?: string;
    isMobile?: boolean;
  }) => {
    if (isEditingName) {
      return (
        <div className={`w-full ${className}`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className={`${
                isMobile 
                  ? 'text-lg' 
                  : 'text-xl lg:text-2xl'
              } font-semibold text-gray-900 bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none flex-1 min-w-0 pb-1`}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateName();
                }
                if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
            />
            <div className="flex gap-1 self-start sm:self-center">
              <button
                onClick={handleUpdateName}
                disabled={isUpdatingName || !editedName.trim()}
                className="p-2 sm:p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BsCheck className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdatingName}
                className="p-2 sm:p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
              >
                <BsX className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-start gap-2 w-full ${className}`}>
        <h1 className={`${
          isMobile 
            ? 'text-lg' 
            : 'text-xl lg:text-2xl'
        } font-semibold text-gray-900 flex-1 min-w-0 leading-tight`}>
          {name}
        </h1>
        <button
          onClick={onEdit}
          className="p-2 sm:p-1 mt-1 sm:mt-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded flex-shrink-0"
        >
          <BsPencil className="h-4 w-4" />
        </button>
      </div>
    );
  };

  if (error && !card) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar menu={menu} />
        <nav className="w-full lg:pl-64 pl-4 mt-4">
          <div className="h-14 flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 lg:w-0"></div>
              <Link 
                to="/dashboard/admin/submissions"
                className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BsArrowLeft className="h-5 w-5" />
              </Link>
              <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
                Submission Detail
              </p>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <ProfileMenu currentUser={currentUser} />
            </div>
          </div>
        </nav>
        
        <div className="lg:pl-64 pl-4 pr-4 pb-4">
          <div className="mt-4 flex justify-center items-center h-64">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-red-500 text-center">
                <MdAssignment className="h-12 w-12 mx-auto mb-4 text-red-300" />
                <p className="text-lg font-medium mb-2">Error Loading Submission</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      {/* Navigation Bar */}
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 lg:w-0"></div>
            <Link 
              to="/dashboard/admin/submissions"
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BsArrowLeft className="h-5 w-5" />
            </Link>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              <span className="hidden lg:inline">Submission Detail</span>
              <span className="lg:hidden">Detail</span>
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
            <Link to="/dashboard/admin/submissions" className="hover:text-gray-700 transition-colors">
              Submissions
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Detail</span>
          </div>

          {/* Error Message */}
          {error && card && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ) : card ? (
            <div className="space-y-6">
              {/* Mobile Card Info */}
              <div className="block lg:hidden">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 mr-4">
                      <EditableCardName 
                        name={card.name} 
                        onEdit={handleStartEdit}
                        className="mb-1"
                        isMobile={true}
                      />
                      <p className="text-sm text-gray-600">{card.brand} • {card.year}</p>
                    </div>
                    {/* <StatusBadge status={card.latest_status.status} /> */}
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
                      <span className="text-gray-600">Verified Grade:</span>
                      <span className="text-gray-900 font-medium">{card.grade ?? "Pending"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="text-gray-900 font-medium">{formatDate(new Date(card.created_at))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <StatusBadge status={card.latest_status.status} />
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

              {/* Mobile Update Card */}
              <div className="block lg:hidden">
                <UpdateCard card={card} />
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex lg:gap-8">
                {/* Card Information */}
                <div className="w-96 bg-white border border-gray-200 p-6 rounded-lg shadow-sm h-fit">
                  <div className="mb-4">
                    <EditableCardName 
                      name={card.name} 
                      onEdit={handleStartEdit}
                      className="mb-2"
                      isMobile={false}
                    />
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
                      <span className="text-gray-600 font-medium">Submitted:</span>
                      <span className="text-gray-900">{formatDate(new Date(card.created_at))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <StatusBadge status={card.latest_status.status} />
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
                        {card.images.map((image: CardImage, index: number) => (
                          <div
                            key={index}
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

                {/* Enhanced Timeline */}
                <div className="flex-1">
                  <EnhancedTimeline 
                    statuses={card.statuses}
                    currentStatus={card.latest_status.status}
                    grade={card.grade}
                    deliveryProofs={deliveryProofs}
                    loadingProofs={uploading}
                  />
                </div>

                {/* Update Card Component */}
                <div className="w-80">
                  <UpdateCard 
                    card={card}
                    onStatusUpdated={(nextStatus, extra) => {
                      setCard((prev) => {
                        if (!prev) return prev;
                        const now = new Date().toISOString();
                        const updated: CardType = {
                          ...prev,
                          latest_status: { status: nextStatus, created_at: now },
                          statuses: [...prev.statuses, { status: nextStatus, created_at: now }],
                          grade: typeof extra?.grade !== 'undefined' ? (extra?.grade as string | null) : prev.grade,
                          serial_number: typeof extra?.serial_number !== 'undefined' ? (extra?.serial_number as string | null) : prev.serial_number,
                        } as CardType;
                        return updated;
                      });
                      // Also fetch from server shortly to reconcile
                      setTimeout(() => { refreshCard(); }, 500);
                    }}
                  />
                </div>
              </div>

              {/* Mobile Enhanced Timeline */}
              <div className="block lg:hidden">
                <EnhancedTimeline 
                  statuses={card.statuses}
                  currentStatus={card.latest_status.status}
                  grade={card.grade}
                  deliveryProofs={deliveryProofs}
                  loadingProofs={uploading}
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
                    {card.images.map((image: CardImage, index: number) => (
                      <div
                        key={index}
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
          ) : null}

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