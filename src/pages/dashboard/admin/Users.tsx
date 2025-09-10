import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEye, BsPeopleFill, BsSearch } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "@/components/SideBar";
import ProfileMenu from "@/components/ProfileMenu";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";

// Type definitions
interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface UsersResponse {
  data: User[];
}

// Alternative response structures
interface ApiResponse {
  users?: User[];
  data?: User[] | UsersResponse;
}

import type { UserType } from "@/types/submission";

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
    shortLabel: "Name"
  },
  {
    label: "Email",
    name: "email",
    shortLabel: "Email"
  },
  {
    label: "Role",
    name: "role",
    shortLabel: "Role"
  },
  {
    label: "Status",
    name: "status",
    shortLabel: "Status"
  },
];

export default function Users() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get<ApiResponse | User[] | UsersResponse>("/users");
        
        if (Array.isArray(response.data)) {
          setUsers({ data: response.data as User[] });
        } else if (response.data && typeof response.data === 'object') {
          const data = response.data as ApiResponse;
          
          if (data.data && Array.isArray(data.data)) {
            setUsers({ data: data.data as User[] });
          } else if (data.users && Array.isArray(data.users)) {
            setUsers({ data: data.users });
          } else if ('data' in data && data.data && typeof data.data === 'object' && 'data' in data.data) {
            setUsers(data.data as UsersResponse);
          } else {
            setUsers({ data: [] });
          }
        } else {
          setUsers({ data: [] });
        }
        
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setUsers({ data: [] });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Filter users based on search term
  const filteredUsers = users?.data?.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden">Users</span>
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
                <BsPeopleFill className="h-12 w-12 mx-auto mb-4 text-red-300" />
                <p className="text-lg font-medium mb-2">Error Loading Users</p>
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
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
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
            All Users
          </h4>
          
          {/* Search Bar */}
          <div className="mb-4 lg:mb-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Results Count */}
                {!loading && (
                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Users Table Container */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {loading ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <BsPeopleFill className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  {searchTerm ? (
                    <div className="px-4">
                      <p className="text-lg font-medium mb-2">No users found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    <p className="text-base px-4">No users found</p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user: User, index: number) => (
                    <div key={user.id || index} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate" title={user.name}>
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 truncate" title={user.email}>
                            {user.email}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        
                        <Link 
                          to={`/dashboard/admin/users/${user.id}`}
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
                  {filteredUsers.map((user: User, index: number) => (
                    <tr key={user.id || index} className="hover:bg-gray-50">
                      <td className="py-3 px-6 text-gray-800">
                        <div className="truncate max-w-[200px]" title={user.name}>
                          {user.name}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                        <div className="truncate max-w-[250px]" title={user.email}>
                          {user.email}
                        </div>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <Link 
                          to={`/dashboard/admin/users/${user.id}`}
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-base">Loading users...</p>
                </div>
              )}
              
              {filteredUsers.length === 0 && !loading && (
                <div className="py-12 text-center text-gray-500">
                  <BsPeopleFill className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  {searchTerm ? (
                    <div className="px-4">
                      <p className="text-lg font-medium mb-2">No users found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    <p className="text-base px-4">No users found</p>
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