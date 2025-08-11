import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import DashboardStats from "../../../components/DashboardStats";
import UserNotifications from "../../../components/AdminNotifications";
import axiosInstance from "../../../lib/axiosInstance";
import { BsPeopleFill } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

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

type UserType = {
  name: string;
  email: string;
  role: string;
};

export default function DashboardAdmin() {
  const [currentUser, setCurrentUser] = useState<UserType | undefined>(undefined);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full pl-62 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <p className="text-xl font-medium text-gray-800">Admin Dashboard</p>
          <div className="flex items-center gap-4">
            {/* User Submissions Notifications */}
            <UserNotifications />
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        {/* Dashboard Content */}
        <div>
          <h4 className="mb-6 text-lg font-medium text-gray-800">Dashboard Overview</h4>
         
          {/* Dashboard Stats Component */}
          <DashboardStats />
        </div>
      </div>
    </div>
  );
}