import { useParams, Link } from "react-router-dom";
import ProfileMenu from "@/components/ProfileMenu";
import UserUpdateCard from "@/components/UserUpdateCard";
import UserTimeline from "@/components/UserTimeline";
import UserLayout from "@/layouts/UserLayout";
import formatDate from "@/utils/FormatDate";
import { getStatusDisplayText, getStatusStyling, getBatchCategoryStyling } from "@/utils/statusUtils";
import { PATHS } from "@/routes/paths";
import type { CardImage } from "@/types/card.types";
import { useTrackingDetail } from "@/hooks/useTrackingDetail";
import { useImageModal } from "@/hooks/useImageModal";
import { ImHome } from "react-icons/im";
import { MdTrackChanges } from "react-icons/md";
import { BsImage } from "react-icons/bs";
import { BE_URL } from "@/lib/api";

const menu = [
  {
    title: "home",
    link: PATHS.DASHBOARD.USER.ROOT,
    icon: ImHome
  },
  {
    title: "track submission",
    link: PATHS.DASHBOARD.USER.TRACKING,
    icon: MdTrackChanges
  },
];

// Keep for compatibility if needed in future, currently unused
// type CardDetailType = CardDetail & { payment_url?: string | null };

export default function UserTrackingDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, card } = useTrackingDetail(id);
  const { selectedImage, open, close } = useImageModal();

  const getStatusBadge = (status: string, includeBorder: boolean = true) => {
    const displayText = getStatusDisplayText(status);
    const styling = getStatusStyling(status, includeBorder);
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styling}`}>
        {displayText}
      </span>
    );
  };

  const getBatchCategoryBadge = (category: string) => {
    const styling = getBatchCategoryStyling(category, true);
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${styling}`}>
        {category}
      </span>
    );
  };

  return (
    <UserLayout
      menu={menu}
      title="Card Details"
      navbarRight={<ProfileMenu currentUser={currentUser} />}
    >
        <div className="mt-0">
          {/* Breadcrumb - Desktop Only */}
          <div className="hidden lg:flex mb-4 text-sm text-gray-500">
            <Link to={PATHS.DASHBOARD.USER.TRACKING} className="hover:text-gray-700 transition-colors">
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
                    {getStatusBadge(card.latest_status.status)}
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
                      {getStatusBadge(card.latest_status.status)}
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
                          {getBatchCategoryBadge(card.batch.category)}
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
                      {getStatusBadge(card.latest_status.status)}
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
                          {getBatchCategoryBadge(card.batch.category)}
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
                            key={image.id}
                            className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <img
                              src={`${BE_URL}/storage/${image.path}`}
                              alt={`Card image ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => open(`${BE_URL}/storage/${image.path}`)}
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

                {/* Timeline Section */}
                <div className="flex-1">
                  <UserTimeline 
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

              {/* Mobile Timeline */}
              <div className="block lg:hidden">
                <UserTimeline 
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
                    {card.images.map((image: CardImage, index: number) => (
                      <div
                        key={image.id}
                        className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={`${BE_URL}/storage/${image.path}`}
                          alt={`Card image ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => open(`${BE_URL}/storage/${image.path}`)}
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
              onClick={close}
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
    </UserLayout>
  );
}