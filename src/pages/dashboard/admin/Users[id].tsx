import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsPeopleFill } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import UserForm from "../../../components/UserForm";
import axiosInstance from "../../../lib/axiosInstance";
import Cookies from "js-cookie";

// Type definitions
interface User {
  id: string | number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
}

interface UserResponse {
  data: User;
}

// Alternative response structures
interface ApiResponse {
  user?: User;
  data?: User | UserResponse;
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

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentUser, setCurrentUser] = useState<CurrentUserType | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
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
      } catch {
        Cookies.remove("token");
        Cookies.remove("role");
        navigate("/signin", { replace: true });
      }
    };
    
    getCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id || !currentUser) return;

      try {
        const response = await axiosInstance.get<ApiResponse | User | UserResponse>(`/users/${id}`);

        if (response.data && typeof response.data === 'object') {
          const data = response.data as ApiResponse;
          
          if (data.data && typeof data.data === 'object') {
            if ('data' in data.data) {
              setUser((data.data as UserResponse).data);
            } else {
              setUser(data.data as User);
            }
          } else if (data.user) {
            setUser(data.user);
          } else if ('name' in data && 'email' in data) {
            setUser(data as User);
          }
        }
        
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [id, currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800">User Detail</p>
          <div className="flex items-center gap-4">
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        <div>
          <div>
            {user ? (
              <UserForm user={user} id={id!} />
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
    </div>
  );
}