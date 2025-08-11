import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
// import UserNotification from "../../../components/UserNotifications";
import UserDashboardStats from "../../../components/UserDashboardStats";
import axiosInstance from "../../../lib/axiosInstance";
import { ImHome } from "react-icons/im";
import { MdAssignmentAdd, MdTrackChanges } from "react-icons/md";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import formatDate from "../../../utils/FormatDate";
import type { CardType } from "../../../components/UserDashboardStats";

const menu = [
  {
    title: "home",
    link: "/dashboard/user",
    icon: ImHome
  },
  {
    title: "create submission",
    link: "/dashboard/user/submissions",
    icon: MdAssignmentAdd
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
    label: "Status",
    name: "status"
  },
  {
    label: "Submitted at",
    name: "created_at",
  },
];

type UserType = {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type CardsResponse = CardType[];

// Helper function to get status styling
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
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
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

        // Get user cards
        const cardsResponse = await axiosInstance.get<CardsResponse>("/user-cards");
        setCards(cardsResponse.data);
        
      } catch (error) {
        console.error(error);
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/signin", { replace: true });
      }
    };
    
    initializeDashboard();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800">Dashboard</p>
          <div className="flex items-center gap-4">
            {/* <UserNotification /> */}
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        {/* Dashboard Content */}
        <div>
          {/* Submission status summary - Now using the component */}
          <UserDashboardStats cards={cards} />

          {/* Submission history */}
          <h5 className="text-lg mt-8 mb-4 font-medium text-gray-800">Submission History</h5>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {cards && cards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {fields.map(field => (
                        <th key={field.name} className="py-3 px-6 font-medium text-gray-700">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cards.map((card: CardType, index: number) => (
                      <tr key={card.id || index} className="hover:bg-gray-50">
                        <td className="py-3 px-6 whitespace-nowrap text-gray-800">{card.name}</td>
                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">{card.year}</td>
                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">{card.brand}</td>
                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">{card.serial_number}</td>
                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">{card.grade_target}</td>
                        <td className="py-3 px-6 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyling(card.latest_status?.status || '')}`}>
                            {card.latest_status?.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">
                          {formatDate(new Date(card.created_at))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MdAssignmentAdd className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">You have not submitted any card yet</p>
                <p className="text-sm text-gray-500 mb-4">Start by creating your first submission</p>
                <button
                  onClick={() => navigate("/dashboard/user/submissions")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Submission
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}