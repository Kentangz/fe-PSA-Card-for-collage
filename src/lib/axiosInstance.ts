import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "./api";

const axiosInstance = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = Cookies.get("token");
		if (token) {
			config.headers.set("Authorization", `Bearer ${token}`);
		}
		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			if (
				window.location.pathname !== "/signin" &&
				!error.config.url?.includes("/login")
			) {
				Cookies.remove("token");
				window.location.href = "/signin";
			}
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
