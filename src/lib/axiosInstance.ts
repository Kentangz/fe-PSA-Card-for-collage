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
			if (!config.headers) {
				config.headers = {};
			}
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			Cookies.remove("token");
			window.location.href = "/signin";
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
