import { useParams, Link } from "react-router-dom";
import ProfileMenu from "@/components/ProfileMenu";
import React, { Suspense } from "react";
const UserUpdateCard = React.lazy(() => import("@/components/UserUpdateCard"));
import { TimelineSection, CardInfoPanel, ImageGallery, ImageModal } from "@/components/tracking-detail";
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
  const { currentUser, card, loading, error } = useTrackingDetail(id);
  const { selectedImage, open, close } = useImageModal();

  

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
                <UserUpdateCard card={card} />
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
                </div>

                {/* Desktop User Action Card */}
                <div className="w-80">
                  <Suspense fallback={<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-40 animate-pulse"></div>}>
                    <UserUpdateCard card={card} />
                  </Suspense>
                </div>
              </div>

              {/* Mobile Timeline */}
              <div className="block lg:hidden">
                <TimelineSection statuses={card.statuses} currentStatus={card.latest_status.status} grade={card.grade} variant="compact" />
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