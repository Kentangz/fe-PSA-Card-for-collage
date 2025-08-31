import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

export function ProtectedRoute() {
  const token = Cookies.get("token");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}