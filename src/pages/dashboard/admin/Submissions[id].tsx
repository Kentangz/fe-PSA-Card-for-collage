import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BsPeopleFill, BsArrowLeft, BsImage } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import UpdateCard from "../../../components/UpdateCard";
import axiosInstance from "../../../lib/axiosInstance";
import { BE_URL} from "../../../lib/api";
import formatDate from "../../../utils/FormatDate";
import Cookies from "js-cookie";

// Type definitions
interface CardStatus {
  status: string;
  created_at: string;
}

interface CardImage {
  path: string;
}

export interface CardType {
  id: string | number;
  name: string;
  year: string;
  brand: string;
  serial_number: string;
  grade: string | null;
  grade_target: string;
  payment_url?: string | null; // NEW FIELD
  created_at: string;
  images: CardImage[];
  statuses: CardStatus[];
  latest_status: CardStatus;
}

interface CardResponse {
  data: CardType;
}

// Alternative response structures
interface ApiResponse {
  card?: CardType;
  data?: CardType | CardResponse;
}

type CurrentUserType = {
  name: string;
  email: string;
  role: string;
};

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

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentUser, setCurrentUser] = useState<CurrentUserType | undefined>(undefined);
  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = Cookies.get("token");
        const role = Cookies.get("role");
        
        if (!token || role !== "admin") {
          navigate("/signin", { replace: true });
          return;
        }

        const response = await axiosInstance.get<CurrentUserType>("/user");
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
    const fetchCard = async () => {
      if (!id || !currentUser) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get<ApiResponse | CardType | CardResponse>(`/card/${id}`);
        
        if (response.data && typeof response.data === 'object') {
          const data = response.data as ApiResponse;
          // console.log(data)
          if (data.data && typeof data.data === 'object') {
            if ('data' in data.data) {
              setCard((data.data as CardResponse).data);
            } else {
              setCard(data.data as CardType);
            }
          } else if (data.card) {
            setCard(data.card);
          } else if ('name' in data && 'brand' in data) {
            setCard(data as CardType);
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id, currentUser]);

  if (error) {
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
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex lg:gap-8">
                {/* Card Information */}
                <div className="w-96 bg-white border border-gray-200 p-6 rounded-lg shadow-sm h-fit">
                  <div className="flex items-center gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">{card.name}</h1>
                    <span className="text-sm text-gray-600">({card.year})</span>
                  </div>
                  <div className="space-y-3">
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
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                  <div className="space-y-4">
                    {card.statuses.map((status: CardStatus, i: number) => (
                      <div key={i} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className={`h-3 w-3 rounded-full border-2 ${
                            i === 0 ? 'bg-blue-500 border-blue-500' : 'bg-gray-300 border-gray-300'
                          }`}></div>
                          {i < card.statuses.length - 1 && (
                            <div className="w-px h-8 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div>
                              <p className="text-gray-900 font-medium capitalize">{status.status}</p>
                              {status.status === "done" && (
                                <p className="text-sm text-blue-600 mt-1">
                                  Card verified (Grade: {card.grade})
                                </p>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                              {formatDate(new Date(status.created_at))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Card Component */}
                <div className="w-80">
                  <UpdateCard card={card} />
                </div>
              </div>

              {/* Mobile Status Timeline */}
              <div className="block lg:hidden">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                  <div className="space-y-4">
                    {card.statuses.map((status: CardStatus, i: number) => (
                      <div key={i} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className={`h-3 w-3 rounded-full border-2 ${
                            i === 0 ? 'bg-blue-500 border-blue-500' : 'bg-gray-300 border-gray-300'
                          }`}></div>
                          {i < card.statuses.length - 1 && (
                            <div className="w-px h-8 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium capitalize">{status.status}</p>
                          {status.status === "done" && (
                            <p className="text-sm text-blue-600 mt-1">
                              Card verified (Grade: {card.grade})
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(new Date(status.created_at))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Update Card */}
              <div className="block lg:hidden">
                <UpdateCard card={card} />
              </div>

              {/* Card Images */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BsImage className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Card Pictures</h3>
                </div>
                
                {card.images && card.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {card.images.map((image: CardImage, i: number) => (
                      <div key={i} className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={`${BE_URL}/storage/${image.path}`} 
                          alt={`Card image ${i + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => setSelectedImage(`${BE_URL}/storage/${image.path}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BsImage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No images available</p>
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