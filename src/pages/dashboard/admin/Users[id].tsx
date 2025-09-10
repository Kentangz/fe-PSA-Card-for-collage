import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BsPeopleFill, BsArrowLeft } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "@/components/SideBar";
import ProfileMenu from "@/components/ProfileMenu";
import UserForm from "@/components/UserForm";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";

// Type definitions
interface User {
  id: string | number;
  name: string;
  email: string;
  phone_number: string;
  role: "admin" | "user";
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

import type { CurrentUser } from "@/types/user.types";

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
  const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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

        const response = await axiosInstance.get<CurrentUser>("/user");
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
    const fetchUser = async () => {
      if (!id || !currentUser) return;

      try {
        setLoading(true);
        setError(null);

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
        
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar menu={menu} />
        
        {/* Navigation Bar */}
        <nav className="w-full lg:pl-64 pl-4 mt-4">
          <div className="h-14 flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 lg:w-0"></div>
              <Link 
                to="/dashboard/admin/users"
                className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BsArrowLeft className="h-5 w-5" />
              </Link>
              <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
                User Detail
              </p>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <ProfileMenu currentUser={currentUser} />
            </div>
          </div>
        </nav>
        
        {/* Error Content */}
        <div className="lg:pl-64 pl-4 pr-4 pb-4">
          <div className="mt-4 flex justify-center items-center h-64">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-red-500 text-center">
                <BsPeopleFill className="h-12 w-12 mx-auto mb-4 text-red-300" />
                <p className="text-lg font-medium mb-2">Error Loading User</p>
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
              to="/dashboard/admin/users"
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BsArrowLeft className="h-5 w-5" />
            </Link>
            <p className="text-lg lg:text-xl font-medium text-gray-800 truncate">
              <span className="hidden lg:inline">User Detail</span>
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
            <Link to="/dashboard/admin/users" className="hover:text-gray-700 transition-colors">
              Users
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Detail</span>
          </div>

          {/* User Info Card - Mobile Only */}
          {user && (
            <div className="block lg:hidden mb-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900 truncate">{user.name}</h1>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                
                {user.phone_number && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm text-gray-900">{user.phone_number}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Form/Content */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="pt-4">
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="p-4 lg:p-6">
                {/* Desktop User Info Header */}
                <div className="hidden lg:block mb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-semibold text-gray-900 mb-1">{user.name}</h1>
                      <p className="text-gray-600">{user.email}</p>
                      {user.phone_number && (
                        <p className="text-gray-600 text-sm mt-1">{user.phone_number}</p>
                      )}
                    </div>
                    <div className="flex gap-3 ml-6">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Form Component */}
                <UserForm user={user} id={id!} />
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <BsPeopleFill className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>User not found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}