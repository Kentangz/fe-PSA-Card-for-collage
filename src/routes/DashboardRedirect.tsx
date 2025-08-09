import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const DashboardRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = Cookies.get("role");
    if (role === "admin") {
      navigate("/dashboard/admin");
    } else if (role === "user") {
      navigate("/dashboard/user");
    } else {
      navigate("/signin"); // kalau gak ada role/token
    }
  }, [navigate]);

  return null; // gak perlu tampilan, langsung redirect
};

export default DashboardRedirect;
