import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AuthRoute } from "@/routes/AuthRoute";
import DashboardRedirect from "@/routes/DashboardRedirect";
import { PATHS } from "@/routes/paths";

// Auth pages
import Signin from "@/pages/auth/Signin";
import Signup from "@/pages/auth/Signup";
import ResetPassword from "@/pages/auth/ResetPassword";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/NotFound";

// Dashboard pages
import DashboardAdmin from "@/pages/dashboard/admin/Dashboard";
import Users from "@/pages/dashboard/admin/Users"
import UserDetail from "@/pages/dashboard/admin/Users[id]";
import Submissions from "@/pages/dashboard/admin/Submissions";
import DoneSubmissions from "@/pages/dashboard/admin/DoneSubmissions";
import RejectedSubmissions from "@/pages/dashboard/admin/RejectedSubmissions";
import SubmissionDetail from "@/pages/dashboard/admin/Submissions[id]";

import DashboardUser from "@/pages/dashboard/user/Dashboard";
import UserSubmissions from "@/pages/dashboard/user/Submissions";
import UserTracking from "@/pages/dashboard/user/Tracking";
import UserTrackingDetail from "@/pages/dashboard/user/Tracking[id]";

// Home
import Home from "@/pages/home/Home";
import ProductDetail from "@/pages/home/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.HOME} element={<Home />} />
        <Route path={PATHS.PRODUCT_DETAIL() } element={<ProductDetail />} />

        <Route path={PATHS.AUTH.SIGNIN} element={<AuthRoute><Signin /></AuthRoute>} />
        <Route path={PATHS.AUTH.SIGNUP} element={<AuthRoute><Signup /></AuthRoute>} />
        <Route path={PATHS.AUTH.FORGOT} element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        {/* Production */}
        <Route path={PATHS.AUTH.RESET()} element={<AuthRoute><ResetPassword /></AuthRoute>} />
        {/* Development */}
        {/* <Route path="/reset-password/" element={<AuthRoute><ResetPassword /></AuthRoute>} /> */}
        
        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.DASHBOARD.ROOT} element={<DashboardRedirect />} />
          <Route path={PATHS.DASHBOARD.ADMIN.ROOT} element={<DashboardAdmin />} />
          <Route path={PATHS.DASHBOARD.ADMIN.USERS} element={<Users />} />
          <Route path={PATHS.DASHBOARD.ADMIN.USER_DETAIL()} element={<UserDetail />} />
          <Route path={PATHS.DASHBOARD.ADMIN.SUBMISSIONS} element={<Submissions />} />
          <Route path={PATHS.DASHBOARD.ADMIN.SUBMISSIONS_DONE} element={<DoneSubmissions />} />
          <Route path={PATHS.DASHBOARD.ADMIN.SUBMISSIONS_REJECTED} element={<RejectedSubmissions />} />
          <Route path={PATHS.DASHBOARD.ADMIN.SUBMISSION_DETAIL()} element={<SubmissionDetail />} />
          
          <Route path={PATHS.DASHBOARD.USER.ROOT} element={<DashboardUser />} />
          <Route path={PATHS.DASHBOARD.USER.SUBMISSIONS} element={<UserSubmissions />} />
          <Route path={PATHS.DASHBOARD.USER.TRACKING} element={<UserTracking />} />
          <Route path={PATHS.DASHBOARD.USER.TRACKING_DETAIL()} element={<UserTrackingDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;