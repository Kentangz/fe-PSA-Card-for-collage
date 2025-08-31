import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import SubmissionList from "../../../components/SubmissionList";
import { useTracking } from "../../../hooks/useTracking";
import { ImHome } from "react-icons/im";
import { MdTrackChanges } from "react-icons/md";

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

const TrackingLoadingSkeleton = () => (
  <div className="space-y-3 sm:space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-grow min-w-0">
            <div className="h-5 bg-gray-200 rounded w-3/5 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/5"></div>
          </div>
          <div className="flex-shrink-0 ml-3 h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="h-9 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);


export default function TrackingPage() {
  const { currentUser, cards, loading, error } = useTracking();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              Track Submission
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      
      <div className="lg:pl-64 pl-4 pr-4 pb-4">
        <div className="mt-4 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <TrackingLoadingSkeleton />
          ) : (
            <SubmissionList cards={cards || []} />
          )}
        </div>
      </div>
    </div>
  );
}