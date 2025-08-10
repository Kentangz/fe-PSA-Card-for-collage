import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEye, BsPeopleFill } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import axiosInstance from "../../../lib/axiosInstance";
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
    label: "Email",
    name: "email"
  },
  {
    label: "Role",
    name: "role"
  },
  {
    label: "Status",
    name: "status"
  },
];

export default function Users() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
  const [users, setUsers] = useState<UsersResponse | null>(null);
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
      } catch (error){
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
        
      } catch (error){
        console.error(error);
        setUsers({ data: [] });
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full mt-4 px-4 lg:px-6">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800 ml-12 lg:ml-0">Users</p>
          <div className="flex items-center gap-4">
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        <div>
          <h4 className="mb-4 text-lg font-medium text-gray-800">All Users</h4>
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
                  {users?.data && Array.isArray(users.data) ? users.data.map((item: User, index: number) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="py-3 px-6 whitespace-nowrap text-gray-800">{item.name}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-gray-600">{item.email}</td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <Link 
                          to={`/dashboard/admin/users/${item.id}`}
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
            
            {users?.data?.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <BsPeopleFill className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}