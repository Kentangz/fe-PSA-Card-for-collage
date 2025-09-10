import { useParams, Link } from "react-router-dom";
import ProfileMenu from "@/components/ProfileMenu";
import React, { Suspense } from "react";
const UserUpdateCard = React.lazy(() => import("@/components/UserUpdateCard"));
import { TimelineSection, CardInfoPanel, ImageGallery, ImageModal } from "@/components/tracking-detail";
import { useDeliveryProofs } from "@/hooks/useDeliveryProofs";
import { getImageUrl } from "@/utils";
import UserLayout from "@/layouts/UserLayout";
import { PATHS } from "@/routes/paths";
import { useTrackingDetail } from "@/hooks/useTrackingDetail";
import { useImageModal } from "@/hooks/useImageModal";
import { ImHome } from "react-icons/im";
import { MdTrackChanges } from "react-icons/md";
import { BsImage } from "react-icons/bs";

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


export default function UserTrackingDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, card, loading, error, applyLocalUpdate, refresh } = useTrackingDetail(id);
  const { selectedImage, open, close } = useImageModal();
  const { deliveryProofs, fetchProofs } = useDeliveryProofs(card?.id);

  // Prefer proofs from card detail payload if present, else fallback to fetched
  const cardDeliveryProofs = ((): { id: number; image_path: string; created_at: string }[] | undefined => {
    if (!card) return undefined;
    const rec = card as unknown as Record<string, unknown>;
    const value = rec["delivery_proofs"];
    return Array.isArray(value) ? (value as { id: number; image_path: string; created_at: string }[]) : undefined;
  })();
  const proofs = (cardDeliveryProofs ?? deliveryProofs);

  React.useEffect(() => {
    if (card?.id && (!cardDeliveryProofs || cardDeliveryProofs.length === 0)) {
      fetchProofs();
    }
  }, [card?.id, cardDeliveryProofs, fetchProofs]);

  return (
    <UserLayout
      menu={menu}
      title="Card Details"
      navbarRight={<ProfileMenu currentUser={currentUser} />}
      isLoading={loading}
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

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {card ? (
            <div className="space-y-6">
              {/* Mobile Card Info */}
              <div className="block lg:hidden">
                <CardInfoPanel card={card} compact />
              </div>

              {/* Mobile User Action Card */}
              <div className="block lg:hidden">
                <UserUpdateCard 
                  card={card}
                  onStatusUpdated={(nextStatus) => {
                    applyLocalUpdate(nextStatus);
                    setTimeout(() => refresh(), 500);
                  }}
                />
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex lg:gap-8">
                {/* Card Information */}
                <div className="w-96 h-fit">
                  <CardInfoPanel card={card} />
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BsImage className="h-4 w-4 text-gray-600" />
                      <h5 className="text-sm font-medium text-gray-800">Card Pictures</h5>
                    </div>
                    <ImageGallery images={card.images} onSelect={open} />
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="flex-1">
                  <TimelineSection statuses={card.statuses} currentStatus={card.latest_status.status} grade={card.grade} variant="full" />
                  {/* Delivery Proofs (Below PSA Grade, same UI as admin) */}
                  {(card.latest_status.status === "done" || card.latest_status.status === "completed") && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BsImage className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Delivery Confirmation</h4>
                      </div>
                      {proofs && proofs.length > 0 ? (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Customer delivery confirmation images ({proofs.length} image{proofs.length > 1 ? 's' : ''})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {proofs.map((p, index) => (
                              <div key={p.id} className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden group">
                                <img
                                  src={getImageUrl(p.image_path)}
                                  alt={`Delivery proof ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200 group-hover:opacity-90"
                                  onClick={() => open(getImageUrl(p.image_path))}
                                />
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  {/* optional timestamp */}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BsImage className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-4" />
                          <p className="text-xs sm:text-sm">No delivery confirmation images available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Desktop User Action Card */}
                <div className="w-80">
                  <Suspense fallback={<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-40 animate-pulse"></div>}>
                    <UserUpdateCard 
                      card={card}
                      onStatusUpdated={(nextStatus) => {
                        applyLocalUpdate(nextStatus);
                        setTimeout(() => refresh(), 500);
                      }}
                    />
                  </Suspense>
                </div>
              </div>

              {/* Mobile Timeline */}
              <div className="block lg:hidden">
                <TimelineSection statuses={card.statuses} currentStatus={card.latest_status.status} grade={card.grade} variant="compact" />
                {/* Delivery Proofs (Below PSA Grade, same UI as admin) */}
                {(card.latest_status.status === "done" || card.latest_status.status === "completed") && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <BsImage className="h-5 w-5 text-gray-600" />
                      <h4 className="text-lg font-medium text-gray-800">Delivery Confirmation</h4>
                    </div>
                    {proofs && proofs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {proofs.map((p, index) => (
                          <div key={p.id} className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={getImageUrl(p.image_path)}
                              alt={`Delivery proof ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => open(getImageUrl(p.image_path))}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BsImage className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-xs">No delivery confirmation images</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Images - Mobile Only */}
              <div className="block lg:hidden bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BsImage className="h-5 w-5 text-gray-600" />
                  <h4 className="text-lg font-medium text-gray-800">Card Pictures</h4>
                </div>
                <ImageGallery images={card.images} onSelect={open} compact />
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
          <ImageModal url={selectedImage} onClose={close} />
        </div>
    </UserLayout>
  );
}