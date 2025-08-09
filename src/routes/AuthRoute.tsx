import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import type { JSX } from "react";

interface AuthRouteProps {
  children: JSX.Element;
}

export function AuthRoute({ children }: AuthRouteProps) {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  if (token) {
    if (role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }
    if (role === "user") {
      return <Navigate to="/dashboard/user" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
