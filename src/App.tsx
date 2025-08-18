import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AuthRoute } from "./routes/AuthRoute";
import DashboardRedirect from "./routes/DashboardRedirect";


// Auth pages
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/Resetpassword";
import ForgotPassword from "./pages/auth/Forgotpassword";


// Dashboard pages
import DashboardAdmin from "./pages/dashboard/admin/Dasboard";
import Users from "./pages/dashboard/admin/Users"
import UserDetail from "./pages/dashboard/admin/Users[id]";
import Submissions from "./pages/dashboard/admin/Submissions";
import SubmissionDetail from "./pages/dashboard/admin/Submissions[id]";

import DashboardUser from "./pages/dashboard/user/Dashboard";
import UserSubmissions from "./pages/dashboard/user/Submissions";
import UserTracking from "./pages/dashboard/user/Tracking";
import UserTrackingDetail from "./pages/dashboard/user/Tracking[id]";

// Home
import Home from "./pages/home/Home";
import ProductDetail from "./pages/home/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Auth routes */}
        <Route
          path="/signin"
          element={
            <AuthRoute>
              <Signin />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <Signup />
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <AuthRoute>
              <ResetPassword />
            </AuthRoute>
          }
        />
        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users/:id"
          element={
            <ProtectedRoute>
              <UserDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/submissions"
          element={
            <ProtectedRoute>
              <Submissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/submissions/:id"
          element={
            <ProtectedRoute>
              <SubmissionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/user"
          element={
            <ProtectedRoute>
              <DashboardUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/user/submissions"
          element={
            <ProtectedRoute>
              <UserSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/user/tracking"
          element={
            <ProtectedRoute>
              <UserTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/user/tracking/:id"
          element={
            <ProtectedRoute>
              <UserTrackingDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
