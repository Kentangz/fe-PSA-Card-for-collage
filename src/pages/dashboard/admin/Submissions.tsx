import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEye, BsPeopleFill } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import axiosInstance from "../../../lib/axiosInstance";
import formatDate from "../../../utils/FormatDate";
import Cookies from "js-cookie";

// Type definitions
export interface CardType {
  id: string | number;
  name: string;
  year: string | number;
  brand: string;
  serial_number: string;
  grade_target: string;
  created_at: string;
  latest_status: {
    status: string;
  };
}

interface CardsResponse {
  data: CardType[];
}

// Alternative response structures
interface ApiResponse {
  cards?: CardType[];
  data?: CardType[] | CardsResponse;
}

type UserType = {
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

// Field configuration
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
    label: "Status",
    name: "status"
  },
  {
    label: "Submitted at",
    name: "submitted_at",
  },
];

// Status styling function
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_process':
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'rejected':
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Submission() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [cards, setCards] = useState<CardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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

        const response = await axiosInstance.get<UserType>("/user");
        setCurrentUser(response.data);
      } catch {
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/signin", { replace: true });
      }
    };
    
    getCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
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
      }
    };

    if (currentUser) {
      fetchCards();
    }
  }, [currentUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar menu={menu} />
        <nav className="w-full pl-62 mt-4">
          <div className="h-14 flex justify-between items-center px-2">
            <p className="text-xl font-medium text-gray-800">Submissions</p>
            <div className="flex items-center gap-4">
              <ProfileMenu currentUser={currentUser} />
            </div>
          </div>
        </nav>
        <div className="flex-grow p-4 ps-64">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800"></p>
          <div className="flex items-center gap-4">
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        <div>
          <h4 className="mb-4 text-lg font-medium text-gray-800">All Submissions</h4>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {fields.map(field => (
                      <th className="py-3 px-6 font-medium text-gray-700" key={field.name}>
                        {field.label}
                      </th>
                    ))}
                    <th className="py-3 px-6 font-medium text-gray-700">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cards?.data && Array.isArray(cards.data) ? cards.data.map((item: CardType, index: number) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="py-3 px-6 whitespace-nowrap text-gray-800">{item.name}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">{item.year}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">{item.brand}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">{item.serial_number}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">{item.grade_target}</td>
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
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <BsEye className="text-lg" />
                        </Link>
                      </td>
                    </tr>
                  )) : null}
                </tbody>
              </table>
            </div>
            
            {cards?.data?.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <MdAssignment className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No submissions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}