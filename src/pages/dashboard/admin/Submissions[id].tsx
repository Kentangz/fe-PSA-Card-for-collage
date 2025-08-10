import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsPeopleFill } from "react-icons/bs";
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

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentUser, setCurrentUser] = useState<CurrentUserType | undefined>(undefined);
  const [card, setCard] = useState<CardType | null>(null);
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
        const response = await axiosInstance.get<ApiResponse | CardType | CardResponse>(`/card/${id}`);
        
        // Cek struktur response dan set card accordingly
        if (response.data && typeof response.data === 'object') {
          const data = response.data as ApiResponse;
          
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
        
      } catch {
        // Handle error appropriately
      }
    };

    fetchCard();
  }, [id, currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800">Submission Detail</p>
          <div className="flex items-center gap-4">
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        <div>
          {card ? (
            <div>
              <div className="flex gap-8 mb-8">
                <div className="w-96 bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-top gap-2 mb-2">
                    <h3 className="text-2xl font-medium text-gray-800">{card.name}</h3>
                    <span className="text-sm font-light text-gray-600">({card.year})</span>
                  </div>
                  <div>
                    <table>
                      <tbody>
                        <tr>
                          <th className="text-start pb-1 text-gray-700">brand</th>
                          <td><span className="px-2 text-gray-600">:</span><span className="text-gray-800">{card.brand}</span></td>
                        </tr>
                        <tr>
                          <th className="text-start pb-1 text-gray-700">serial number</th>
                          <td><span className="px-2 text-gray-600">:</span><span className="text-gray-800">{card.serial_number}</span></td>
                        </tr>
                        <tr>
                          <th className="text-start pb-1 text-gray-700">verified grade</th>
                          <td><span className="px-2 text-gray-600">:</span><span className="text-gray-800">{card.grade ?? "-"}</span></td>
                        </tr>
                        <tr>
                          <th className="text-start pb-1 text-gray-700">target grade</th>
                          <td><span className="px-2 text-gray-600">:</span><span className="text-gray-800">{card.grade_target}</span></td>
                        </tr>
                        <tr>
                          <th className="text-start pb-1 text-gray-700">submitted at</th>
                          <td><span className="px-2 text-gray-600">:</span><span className="text-gray-800">{formatDate(new Date(card.created_at))}</span></td>
                        </tr>
                        <tr>
                          <th className="text-start pb-1 text-gray-700">status</th>
                          <td><span className="px-2 text-gray-600">:</span><span className="text-gray-800">{card.latest_status.status}</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  {card.statuses.map((data: CardStatus, i: number) => (
                    <div key={i} className="py-2 border-s border-gray-400 px-4 relative flex flex-col justify-center">
                      <div className="h-4 w-4 absolute bg-gray-300 -left-2 rounded-full border border-gray-400"></div>
                      <div className="text-lg">
                        <p className="text-gray-800">{data.status}</p> 
                        {data.status === "done" && (
                          <p className="text-sm text-blue-500">
                            card is verified (grade: {card.grade})
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(new Date(data.created_at))}</p>
                    </div>
                  ))}
                </div>
                <UpdateCard card={card} />
              </div>
              <h4 className="mb-4 text-lg text-gray-800">Card Pictures</h4>
              <div className="flex gap-2 overflow-x-auto flex-nowrap rounded mb-4">
                {card.images.map((item: CardImage, i: number) => (
                  <div key={i} className="bg-neutral-500 w-96 flex-shrink-0 flex justify-center items-center rounded">
                    <img 
                      src={`${BE_URL}/storage/${item.path}`} 
                      alt={`Card image ${i + 1}`}
                      width={500} height={500}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}