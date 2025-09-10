import { FaUser } from "react-icons/fa";
import { useState } from "react";
import { GoSignOut } from "react-icons/go";
import axiosInstance from "../lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import type { CurrentUser } from "@/types/user.types";

export default function ProfileMenu({ currentUser }: { currentUser?: CurrentUser }) {
  const [profileMenu, setProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout');
    } catch (error){
      console.error(error);
    } finally {
      Cookies.remove('token');
      Cookies.remove('role');
      
      localStorage.clear();
      sessionStorage.clear();
      
      navigate('/signin', { replace: true });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setProfileMenu(!profileMenu)}
        className="flex items-center justify-center h-10 font-medium w-10 text-xl text-white rounded-full bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors shadow-md"
      >
        <FaUser />
      </button>
      <div
        className={`${
          !profileMenu && "hidden"
        } bg-white border border-gray-200 shadow-lg rounded p-2 w-60 absolute top-12 right-0 z-30`}
      >
        <div className="flex items-center gap-2 p-2 mb-2">
          <div className="flex items-center justify-center h-10 font-medium w-10 text-xl rounded-full bg-blue-600 text-white">
            <FaUser />
          </div>
          <div>
            <p className="font-medium text-gray-800">
              {currentUser?.name || 'Loading...'}
            </p>
            <p className="text-sm text-gray-600 font-light">
              {currentUser?.email || 'Loading...'}
            </p>
          </div>
        </div>
        {/* <Link 
          to="/profile" 
          onClick={() => setProfileMenu(false)} 
          className="hover:bg-gray-100 flex items-center gap-2 p-2 rounded text-sm"
        >
          <FaUser />
          View Profile
        </Link> */}
        <button
          onClick={handleLogout}
          className="hover:bg-red-50 hover:text-red-600 flex items-center gap-2 w-full p-2 rounded cursor-pointer text-sm transition-colors"
        >
          <GoSignOut />
          Sign out
        </button>
      </div>
    </div>
  );
}