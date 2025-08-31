import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import UserDashboardStats from "../../../components/UserDashboardStats";
import ActiveBatches from "../../../components/ActiveBatches";
import SubmissionHistory from "../../../components/SubmissionHistory";
import { useUserDashboard } from "../../../hooks/useUserDashboard";
import { ImHome } from "react-icons/im";
import { MdTrackChanges } from "react-icons/md";

const menu = [
  { title: "home", link: "/dashboard/user", icon: ImHome },
  { title: "track submission", link: "/dashboard/user/tracking", icon: MdTrackChanges },
];

export default function DashboardUser() {
  const { currentUser, cards, activeBatches, loading } = useUserDashboard();
  const navigate = useNavigate();
  const handleCreateSubmission = (batchId: number) => {
    navigate(`/dashboard/user/submissions?batch_id=${batchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar menu={menu} />
        <nav className="w-full lg:pl-64 pl-4 mt-4">
          <div className="h-14 flex justify-between items-center px-2">
            <div className="flex items-center">
              <div className="w-10 lg:w-0"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </nav>
        <div className="lg:pl-64 pl-4 pr-4 pb-4">
          <div className="mt-4 space-y-6">
            {/* Skeleton loading */}
            <div className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              Dashboard Overview
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      
      <div className="lg:pl-64 pl-4 pr-4 pb-4">
        <div className="mt-4 space-y-6 sm:space-y-8">
          <UserDashboardStats cards={cards} />
          <ActiveBatches 
            batches={activeBatches} 
            isLoading={loading}
            onCreateSubmission={handleCreateSubmission} 
          />
          <SubmissionHistory cards={cards} />

        </div>
      </div>
    </div>
  );
}