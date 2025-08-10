import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import Sidebar from "../../../components/SideBar";
import ProfileMenu from "../../../components/ProfileMenu";
import axiosInstance from "../../../lib/axiosInstance";
import { BsPeopleFill } from "react-icons/bs";
import { ImHome } from "react-icons/im";
import { MdAssignment } from "react-icons/md";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const bar_chart_data = [
  { month: 'Jan', count: 24 },
  { month: 'Feb', count: 30 },
  { month: 'Mar', count: 34 },
  { month: 'Apr', count: 38 },
  { month: 'Jun', count: 45 },
];

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
            <ProfileMenu currentUser={currentUser} />
          </div>
        </div>
      </nav>
      <div className="flex-grow p-4 ps-64">
        {/* Dashboard Content */}
        <div>
          <div className="flex gap-2 flex-wrap mb-8">
            <div className="bg-white border border-gray-200 w-60 p-4 text-center rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-2 text-gray-800">105</h2>
              <p className="text-sm text-gray-600">cards submitted</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 w-60 p-4 text-center rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-2 text-blue-800">23</h2>
              <p className="text-sm text-blue-600">cards accepted</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 w-60 p-4 text-center rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-2 text-yellow-800">50</h2>
              <p className="text-sm text-yellow-600">cards in process</p>
            </div>
            <div className="bg-green-50 border border-green-200 w-60 p-4 text-center rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-2 text-green-800">20</h2>
              <p className="text-sm text-green-600">done</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h4 className="mb-4 text-lg font-medium text-gray-800">Monthly Submission</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bar_chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h4 className="mb-4 text-lg font-medium text-gray-800">New users this month</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bar_chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}