import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEye, BsPeopleFill } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import SubmissionFilter from "../../../components/SubmissionFilter";
import axiosInstance from "../../../lib/axiosInstance";
import formatDate from "../../../utils/formatDate";
import { filterAndSortSubmissions } from "../../../utils/submissionUtils";
import type { CardType, CardsResponse, ApiResponse, FilterOptions, UserType } from "../../../types/submission";
import type { Batch } from "../../../types/batch.types";
import Cookies from "js-cookie";
import { batchService } from "../../../services/batchService";

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

// Field configuration
const fields = [
  {
    label: "Name",
    name: "name",
    shortLabel: "Name"
  },
  {
    label: "Year",
    name: "year",
    shortLabel: "Year"
  },
  {
    label: "Brand",
    name: "brand",
    shortLabel: "Brand"
  },
  {
    label: "Serial Number",
    name: "serial_number",
    shortLabel: "Serial"
  },
  {
    label: "Grade",
    name: "grade",
    shortLabel: "Grade"
  },
  {
    label: "Batch",
    name: "batch",
    shortLabel: "Batch"
  },
  {
    label: "Status",
    name: "status",
    shortLabel: "Status"
  },
  {
    label: "Submitted at",
    name: "submitted_at",
    shortLabel: "Date"
  },
];

const getStatusStyle = (status: string) => {
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case 'submitted':
      return 'bg-orange-100 text-orange-800';
    case 'accepted':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'on process':
    case 'processing':
    case 'in_process':
      return 'bg-blue-100 text-blue-800';
    case 'done':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      // Handle variations in status names
      if (normalizedStatus.includes('submit')) {
        return 'bg-orange-100 text-orange-800';
      } else if (normalizedStatus.includes('accept')) {
        return 'bg-yellow-100 text-yellow-800';
      } else if (normalizedStatus.includes('reject')) {
        return 'bg-red-100 text-red-800';
      } else if (normalizedStatus.includes('process')) {
        return 'bg-blue-100 text-blue-800';
      } else if (normalizedStatus.includes('done') || normalizedStatus.includes('complete')) {
        return 'bg-green-100 text-green-800';
      } else {
        return 'bg-gray-100 text-gray-800';
      }
  }
};

export default function RejectedSubmissions() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [cards, setCards] = useState<CardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const navigate = useNavigate();

  const getBatchInfo = (batchId: number | null | undefined): string => {
    if (!batchId) return 'No Batch';
    const batch = batches.find(b => b.id === batchId);
    return batch ? `${batch.batch_number} (${batch.category})` : `Batch #${batchId}`;
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
    const fetchRejectedCards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get<ApiResponse | CardType[] | CardsResponse>("/card", {
          params: { status: "rejected" }
        });
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

    if (currentUser) {
      fetchRejectedCards();
    }
  }, [currentUser]);

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
                <span className="hidden sm:inline">Rejected Submissions</span>
                <span className="sm:hidden">Rejected</span>
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
                <p className="text-lg font-medium mb-2">Error Loading Rejected Submissions</p>
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
              <span className="hidden sm:inline">Rejected Submissions</span>
              <span className="sm:hidden">Rejected</span>
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
          <h4 className="mb-4 lg:mb-6 text-base lg:text-lg font-medium text-gray-800">
            Rejected Submissions
          </h4>
          
          <div className="mb-4 lg:mb-6">
            <SubmissionFilter
              onFilterChange={handleFilterChange}
              totalResults={filteredSubmissions.length}
              isLoading={loading}
            />
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {loading ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-sm">Loading rejected submissions...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="mx-auto h-12 w-12 text-red-300 mb-4 flex items-center justify-center">
                    ✕
                  </div>
                  {filters.searchTerm ? (
                    <div className="px-4">
                      <p className="text-lg font-medium mb-2">No rejected submissions found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    <p className="text-base px-4">No rejected submissions found</p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredSubmissions.map((item: CardType, index: number) => (
                    <div key={item.id || index} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.brand} • {item.year}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${getStatusStyle(item.latest_status.status)}`}>
                          {item.latest_status.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Serial:</span> {item.serial_number}
                        </div>
                        <div>
                          <span className="font-medium">Grade:</span> {item.grade}
                        </div>
                        <div>
                          <span className="font-medium">Batch:</span> {getBatchInfo(item.batch_id)}
                        </div>
                        <div className="col-span-1">
                          <span className="font-medium">Submitted:</span> {formatDate(new Date(item.created_at))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Link 
                          to={`/dashboard/admin/submissions/${item.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <BsEye className="mr-1 h-3 w-3" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-left min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {fields.map(field => (
                      <th 
                        className="py-3 px-6 font-medium text-gray-700 whitespace-nowrap" 
                        key={field.name}
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="py-3 px-6 font-medium text-gray-700 whitespace-nowrap">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubmissions.map((item: CardType, index: number) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="py-3 px-6 text-gray-800">
                        <div className="truncate max-w-[200px]" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">{item.year}</td>
                      <td className="py-3 px-6 text-gray-600">
                        <div className="truncate max-w-[120px]" title={item.brand}>
                          {item.brand}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <div className="truncate max-w-[150px]" title={item.serial_number}>
                          {item.serial_number}
                        </div>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">{item.grade}</td>
                      <td className="py-3 px-6 text-gray-600">
                        <div className="truncate max-w-[150px]" title={getBatchInfo(item.batch_id)}>
                          {getBatchInfo(item.batch_id)}
                        </div>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(item.latest_status.status)}`}>
                          {item.latest_status.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">
                        {formatDate(new Date(item.created_at))}
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <Link 
                          to={`/dashboard/admin/submissions/${item.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50"
                        >
                          <BsEye className="text-lg" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Desktop Loading and Empty States */}
            <div className="hidden lg:block">
              {loading && (
                <div className="py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-base">Loading rejected submissions...</p>
                </div>
              )}
              
              {filteredSubmissions.length === 0 && !loading && (
                <div className="py-12 text-center text-gray-500">
                  <div className="mx-auto h-12 w-12 text-red-300 mb-4 flex items-center justify-center text-2xl">
                    ✕
                  </div>
                  {filters.searchTerm ? (
                    <div className="px-4">
                      <p className="text-lg font-medium mb-2">No rejected submissions found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    <p className="text-base px-4">No rejected submissions found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}