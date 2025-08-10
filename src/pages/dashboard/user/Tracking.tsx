import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import UserNotification from "../../../components/UserNotifications";
import axiosInstance from "../../../lib/axiosInstance";
import formatDate from "../../../utils/FormatDate";
import { Link } from "react-router-dom";
import { ImHome } from "react-icons/im";
import { MdAssignmentAdd, MdTrackChanges } from "react-icons/md";
import { BsEye } from "react-icons/bs";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

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
    label: "Serial Number",
    name: "serial_number"
  },
  {
    label: "Verified Grade",
    name: "verified_grade"
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

type UserType = {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type CardType = {
  id: string;
  user_id: number;
  name: string;
  year: number;
  brand: string;
  serial_number: string;
  latest_status: { 
    id: number;
    card_id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  grade_target: string;
  grade: string | null;
  created_at: string;
  updated_at: string;
};

type CardsResponse = CardType[];

export default function UserTracking() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [cards, setCards] = useState<CardsResponse | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeTracking = async () => {
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
    
    initializeTracking();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let badgeClass = "px-2 py-1 rounded-full text-xs font-medium ";
    
    switch (statusLower) {
      case 'submitted':
        badgeClass += "bg-gray-100 text-gray-800";
        break;
      case 'accepted':
        badgeClass += "bg-blue-100 text-blue-800";
        break;
      case 'in process':
      case 'processing':
        badgeClass += "bg-yellow-100 text-yellow-800";
        break;
      case 'done':
      case 'completed':
        badgeClass += "bg-green-100 text-green-800";
        break;
      case 'rejected':
        badgeClass += "bg-red-100 text-red-800";
        break;
      default:
        badgeClass += "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={badgeClass}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800">Track Submission</p>
          <div className="flex items-center gap-4">
            <UserNotification />
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        {/* Tracking Content */}
        <div>
          
          {cards && cards.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {fields.map(field => (
                        <th key={field.name} className="py-3 px-6 font-medium text-gray-700">
                          {field.label}
                        </th>
                      ))}
                      <th className="py-3 px-6 font-medium text-gray-700 text-center">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cards.map((card: CardType, index: number) => (
                      <tr key={card.id || index} className="hover:bg-gray-50">
                        <td className="py-3 px-6 whitespace-nowrap text-gray-800 font-medium">
                          {card.name}
                        </td>
                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">
                          {card.serial_number}
                        </td>
                        <td className="py-3 px-6 whitespace-nowrap">
                          {card.grade ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {card.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-6 whitespace-nowrap">
                          {getStatusBadge(card.latest_status?.status || 'Unknown')}
                        </td>
                        <td className="py-3 px-6 whitespace-nowrap text-gray-600">
                          {formatDate(new Date(card.created_at))}
                        </td>
                        <td className="py-3 px-6 whitespace-nowrap text-center">
                          <Link
                            to={`/dashboard/user/tracking/${card.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="View Details"
                          >
                            <BsEye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MdTrackChanges className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No submissions to track</p>
                <p className="text-sm text-gray-500 mb-4">You haven't submitted any cards yet</p>
                <button
                  onClick={() => navigate("/dashboard/user/submissions")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Submission
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}