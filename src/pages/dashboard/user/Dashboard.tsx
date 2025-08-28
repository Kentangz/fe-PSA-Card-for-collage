import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
// import UserNotification from "../../../components/UserNotifications";
import UserDashboardStats from "../../../components/UserDashboardStats";
import BatchCard from "../../../components/UserBatchCard";
import axiosInstance from "../../../lib/axiosInstance";
import { ImHome } from "react-icons/im";
import { MdAssignmentAdd, MdTrackChanges } from "react-icons/md";
import { HiOutlineClipboardList, HiChevronDown, HiChevronUp } from "react-icons/hi";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import formatDate from "../../../utils/FormatDate";
import type { CardType } from "../../../components/UserDashboardStats";
import type { BatchType, UserType} from "../../../types/submission";

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

const fields = [
  {
    label: "Name",
    name: "name",
  },
  {
    label: "Year",
    name: "year"
  },
  {
    label: "Brand",
    name: "brand"
  },
  {
    label: "Serial Number",
    name: "serial_number"
  },
  {
    label: "Grade Target",
    name: "grade_target"
  },
  {
    label: "Grade",
    name: "grade"
  },
  {
    label: "Status",
    name: "status"
  },
  {
    label: "Submitted at",
    name: "created_at",
  },
];

type CardsResponse = CardType[];

const getStatusStyling = (status: string) => {
  const normalizedStatus = status?.toLowerCase().trim() || '';
  
  switch (normalizedStatus) {
    case 'submitted':
      return 'bg-orange-100 text-orange-800';
    case 'accepted':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'on process':
      return 'bg-blue-100 text-blue-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardUser() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [cards, setCards] = useState<CardsResponse | undefined>(undefined);
  const [activeBatches, setActiveBatches] = useState<BatchType[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [isBatchesExpanded, setIsBatchesExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
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

        // Get user cards and active batches in parallel
        const [cardsResponse, batchesResponse] = await Promise.all([
          axiosInstance.get<CardsResponse>("/user-cards"),
          axiosInstance.get<BatchType[]>("/active-batches")
        ]);
        
        setCards(cardsResponse.data);
        setActiveBatches(batchesResponse.data);
        
      } catch (error) {
        console.error(error);
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/signin", { replace: true });
      } finally {
        setLoading(false);
        setBatchesLoading(false);
      }
    };
    
    initializeDashboard();
  }, [navigate]);

  const handleCreateSubmission = (batchId: number) => {
    navigate(`/dashboard/user/submissions?batch_id=${batchId}`);
  };

  // Loading State Component
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      {/* Navigation Bar Skeleton */}
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
      
      {/* Content Skeleton */}
      <div className="lg:pl-64 pl-4 pr-4 pb-4">
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 animate-pulse h-16 sm:h-20 lg:h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 animate-pulse h-48 rounded-lg"></div>
          <div className="bg-gray-200 animate-pulse h-64 sm:h-80 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  // Active Batches Section Component
  const ActiveBatchesSection = () => (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Accordion Header */}
        <button
          onClick={() => setIsBatchesExpanded(!isBatchesExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h5 className="text-base sm:text-lg font-medium text-gray-800">
              Batches
            </h5>
            {!batchesLoading && activeBatches && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                {activeBatches.length}
              </span>
            )}
          </div>
          <div className="flex items-center">
            {isBatchesExpanded ? (
              <HiChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <HiChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Accordion Content */}
        {isBatchesExpanded && (
          <div className="border-t border-gray-200">
            {batchesLoading ? (
              <div className="p-6 sm:p-8">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeBatches && activeBatches.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {activeBatches.map((batch) => (
                  <BatchCard key={batch.id} batch={batch} onCreateSubmission={handleCreateSubmission} />
                ))}
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <HiOutlineClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2 text-sm sm:text-base">No batches open</p>
                <p className="text-xs sm:text-sm text-gray-500">Submissions are currently unavailable. Please check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Submission History Section Component
  const SubmissionHistorySection = () => (
    <div className="w-full">
      <h5 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">
        <span className="hidden sm:inline">Submission History</span>
        <span className="sm:hidden">History</span>
      </h5>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {cards && cards.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {fields.map(field => (
                      <th key={field.name} className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cards.map((card: CardType, index: number) => (
                    <tr key={card.id || index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{card.name}</td>
                      <td className="py-3 px-4 text-gray-600">{card.year}</td>
                      <td className="py-3 px-4 text-gray-600">{card.brand}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{card.serial_number}</td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{card.grade_target}</td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{card.grade}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyling(card.latest_status?.status || '')}`}>
                          {card.latest_status?.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {formatDate(new Date(card.created_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {cards.map((card: CardType, index: number) => (
                <div key={card.id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h6 className="font-medium text-gray-800 truncate pr-2">{card.name}</h6>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusStyling(card.latest_status?.status || '')}`}>
                        {card.latest_status?.status || 'Unknown'}
                      </span>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="ml-1 text-gray-800">{card.brand}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Year:</span>
                        <span className="ml-1 text-gray-800">{card.year}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Serial:</span>
                        <span className="ml-1 text-gray-800 font-mono text-xs">{card.serial_number}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-1 text-gray-800 font-medium">{card.grade_target}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-1 text-gray-800 text-xs">{formatDate(new Date(card.created_at))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <MdAssignmentAdd className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2 text-sm sm:text-base">No submissions yet</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Start by selecting an batch above</p>
          </div>
        )}
      </div>
    </div>
  );

  // Early return for loading state
  if (loading) {
    return <LoadingComponent />;
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      
      {/* Navigation Bar */}
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              <span className="hidden sm:inline">Dashboard Overview</span>
              <span className="sm:hidden">Dashboard</span>
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
        <div className="mt-4 space-y-6 sm:space-y-8">
          {/* Dashboard Stats */}
          <div className="w-full">
            <UserDashboardStats cards={cards} />
          </div>

          {/* Active Batches Section */}
          <ActiveBatchesSection />

          {/* Submission History */}
          <SubmissionHistorySection />
        </div>
      </div>
    </div>
  );
}