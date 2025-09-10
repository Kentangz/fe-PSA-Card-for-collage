import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsPeopleFill } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "@/components/SideBar";
import ProfileMenu from "@/components/ProfileMenu";
import SubmissionFilter from "@/components/SubmissionFilter";
import AddBatchModal from "@/components/AddBatchModal";
import BatchEntryAccordion from "@/components/BatchEntryAccordion";
import axiosInstance from "@/lib/axiosInstance";
import { filterAndSortSubmissions } from "@/utils/submissionUtils";
import type { CardType, CardsResponse, ApiResponse, FilterOptions, UserType } from "@/types/submission";
import type { Batch } from "@/types/batch.types";
import Cookies from "js-cookie";
import { batchService } from "@/services/batchService";

// Menu configuration with submenu
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
    icon: MdAssignment,
    subMenu: [
      {
        title: "all submissions",
        link: "/dashboard/admin/submissions"
      },
      {
        title: "done",
        link: "/dashboard/admin/submissions/done"
      },
      {
        title: "rejected",
        link: "/dashboard/admin/submissions/rejected"
      }
    ]
  }
];

export default function Submission() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [cards, setCards] = useState<CardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const navigate = useNavigate();
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(new Set());
  const [batchUpdateError, setBatchUpdateError] = useState<string | null>(null);

  // Group submissions by batch
  const groupedSubmissions = useMemo(() => {
    if (!cards?.data || !batches.length) return [];

    const submissionsMap = new Map<number | null, CardType[]>();
    
    // Initialize with empty arrays for all batches
    batches.forEach(batch => {
      submissionsMap.set(batch.id, []);
    });

    // Group submissions by batch_id
    cards.data.forEach(submission => {
      const batchId = submission.batch_id || null;
      if (submissionsMap.has(batchId)) {
        submissionsMap.get(batchId)!.push(submission);
      } else {
        submissionsMap.set(batchId, [submission]);
      }
    });

    // Convert to array and sort batches by created_at desc
    return batches.map(batch => ({
      batch,
      submissions: submissionsMap.get(batch.id) || []
    }));
  }, [cards?.data, batches]);

  const toggleBatch = (batchId: number) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);
    }
    setExpandedBatches(newExpanded);
  };

  const handleToggleBatchStatus = async (batchId: number, currentStatus: boolean) => {
    try {
      setBatchUpdateError(null);
      
      const response = await axiosInstance.put(`/batches/${batchId}`, {
        is_active: !currentStatus
      });

      if (response.status === 200) {
        // Update the batch in local state
        setBatches(prevBatches => 
          prevBatches.map(batch => 
            batch.id === batchId 
              ? { ...batch, is_active: !currentStatus }
              : batch
          )
        );
      }
    } catch (error) {
      console.error('Failed to update batch status:', error);
      setBatchUpdateError('Failed to update batch status. Please try again.');
    }
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const batchData = await batchService.getAllBatches();
        setBatches(batchData);
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      }
    };

    if (currentUser?.role === 'admin') {
      fetchBatches();
    }
  }, [currentUser]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get<ApiResponse | CardType[] | CardsResponse>("/card");
      if (Array.isArray(response.data)) {
        setCards({ data: response.data as CardType[] });
      } else if (response.data && typeof response.data === 'object') {
        const data = response.data as ApiResponse;
        if (data.data && Array.isArray(data.data)) {
          setCards({ data: data.data as CardType[] });
        } else if (data.cards && Array.isArray(data.cards)) {
          setCards({ data: data.cards });
        } else if ('data' in data && data.data && typeof data.data === 'object' && 'data' in data.data) {
          setCards(data.data as CardsResponse);
        } else {
          setCards({ data: [] });
        }
      } else {
        setCards({ data: [] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatchSuccess = async () => {
    try {
      // Refresh both cards and batches data
      if (currentUser) {
        await fetchCards();
      }
      
      const batchesData = await batchService.getAllBatches();
      setBatches(batchesData);
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = Cookies.get("token");
        const role = Cookies.get("role");
        
        if (!token || role !== "admin") {
          navigate("/signin", { replace: true });
          return;
        }

        const response = await axiosInstance.get<UserType>("/user");
        setCurrentUser(response.data);
      } catch (error) {
        console.error(error);
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/signin", { replace: true });
      }
    };
    
    getCurrentUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchCards();
    }
  }, [currentUser]);

  // Update handleAddBatch
  const handleAddBatch = () => {
    setShowAddBatchModal(true);
  };

  // filtered and sorted data
  const filteredSubmissions = useMemo(() => {
    if (!cards?.data) return [];
    return filterAndSortSubmissions(cards.data, filters);
  }, [cards?.data, filters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar menu={menu} />
        {/* Navigation Bar */}
        <nav className="w-full lg:pl-64 pl-4 mt-4">
          <div className="h-14 flex justify-between items-center px-2">
            <div className="flex items-center">
              <div className="w-10 lg:w-0"></div>
              <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
                <span className="hidden sm:inline">Submissions</span>
                <span className="sm:hidden">Submissions</span>
              </p>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <ProfileMenu currentUser={currentUser} />
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <div className="lg:pl-64 pl-4 pr-4 pb-4">
          <div className="mt-4 flex justify-center items-center h-64">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-red-500 text-center">
                <MdAssignment className="h-12 w-12 mx-auto mb-4 text-red-300" />
                <p className="text-lg font-medium mb-2">Error Loading Submissions</p>
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
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              <span className="hidden sm:inline">Submissions</span>
              <span className="sm:hidden">Submissions</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {/* Header Add Batch (desktop) */}
            <button
              onClick={handleAddBatch}
              className="hidden lg:inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              + Add Batch
            </button>
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="lg:pl-64 pl-4 pr-4 pb-4">
        <div className="mt-4">
          <h4 className="mb-4 lg:mb-6 text-base lg:text-lg font-medium text-gray-800">
            Submissions by Batch
          </h4>
          
          <div className="mb-4 lg:mb-6">
            <SubmissionFilter
              onFilterChange={handleFilterChange}
              totalResults={filteredSubmissions.length}
              isLoading={loading}
              showAddBatch={false}
              onAddBatch={handleAddBatch}
            />
          </div>

          {/* Error Message */}
          {batchUpdateError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{batchUpdateError}</p>
              <button 
                onClick={() => setBatchUpdateError(null)}
                className="text-red-500 hover:text-red-700 text-sm underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Batch Accordions */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 sm:p-12">
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base">Loading batches and submissions...</p>
              </div>
            </div>
          ) : batches.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 sm:p-12">
              <div className="text-center text-gray-500">
                <MdAssignment className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No batches found</p>
                <p className="text-xs sm:text-sm">Create a new batch to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {groupedSubmissions.map(({ batch }) => (
                <BatchEntryAccordion
                  key={batch.id}
                  batch={batch}
                  isOpen={expandedBatches.has(batch.id)}
                  onToggle={() => toggleBatch(batch.id)}
                  onToggleBatchStatus={handleToggleBatchStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Batch Button (mobile) */}
      <button
        onClick={handleAddBatch}
        className="lg:hidden fixed bottom-6 right-6 inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Add Batch"
      >
        +
      </button>
      
      {/* Add Batch Modal */}
      <AddBatchModal
        isOpen={showAddBatchModal}
        onClose={() => setShowAddBatchModal(false)}
        onSuccess={handleAddBatchSuccess}
      />
    </div>
  );
}