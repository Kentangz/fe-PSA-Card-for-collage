import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";

type UserType = {
  name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
};

export default function UserForm({ user, id }: { user: UserType; id: string }) {
  const navigate = useNavigate();

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number"),
      role: formData.get("role"),
    } as Record<string, string>;

    try {
      // setLoading(true);
      const response = await axiosInstance.put(`/users/${id}`, userData);
      
      if (response.status === 200) {
        navigate(-1);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: { errors: Record<string, string[]> } } };
        if (axiosError.response?.status === 422) {
          // setError(axiosError.response.data.errors);
        }
      }
    } finally {
      // setLoading(false);
    }
  };

  const handleToggleAccount = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axiosInstance.put(`/users/toggle/${id}`, { 
        is_active:user.is_active 
      });
      
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleUpdate}>
        <div className="flex flex-col gap-4 w-80">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              required
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              required
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              defaultValue={user.phone_number}
              required
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              name="role" 
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              defaultValue={user.role}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="bg-blue-600 h-10 hover:bg-blue-700 active:bg-blue-800 rounded-lg cursor-pointer text-white font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
        
        <div className="mt-6">
          <button
            type="button"
            onClick={handleToggleAccount}
            className={`h-10 rounded-lg cursor-pointer text-white font-medium w-80 transition-colors ${
              user.is_active 
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800" 
                : "bg-green-600 hover:bg-green-700 active:bg-green-800"
            }`}
          >
            {user.is_active ? "Deactivate" : "Activate"} Account
          </button>
        </div>
      </form>
    </div>
  );
}