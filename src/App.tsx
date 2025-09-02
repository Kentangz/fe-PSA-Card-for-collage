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
import DoneSubmissions from "./pages/dashboard/admin/DoneSubmissions";
import RejectedSubmissions from "./pages/dashboard/admin/RejectedSubmissions";
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
        <Route path="/" element={<Home />} />
        <Route path="/product/:serialNumber" element={<ProductDetail />} />

        <Route path="/signin" element={<AuthRoute><Signin /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
        {/* Production */}
        <Route path="/reset-password/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} />
        {/* Development */}
        {/* <Route path="/reset-password/" element={<AuthRoute><ResetPassword /></AuthRoute>} /> */}
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="/dashboard/admin/users" element={<Users />} />
          <Route path="/dashboard/admin/users/:id" element={<UserDetail />} />
          <Route path="/dashboard/admin/submissions" element={<Submissions />} />
          <Route path="/dashboard/admin/submissions/done" element={<DoneSubmissions />} />
          <Route path="/dashboard/admin/submissions/rejected" element={<RejectedSubmissions />} />
          <Route path="/dashboard/admin/submissions/:id" element={<SubmissionDetail />} />
          
          <Route path="/dashboard/user" element={<DashboardUser />} />
          <Route path="/dashboard/user/submissions" element={<UserSubmissions />} />
          <Route path="/dashboard/user/tracking" element={<UserTracking />} />
          <Route path="/dashboard/user/tracking/:id" element={<UserTrackingDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;