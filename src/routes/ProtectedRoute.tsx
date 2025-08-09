// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import type { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role || "")) {
    return <Navigate to="/" replace />;
  }

  return children;
}
