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
      navigate("/signin");
    }
  }, [navigate]);

  return null;
};

export default DashboardRedirect;
