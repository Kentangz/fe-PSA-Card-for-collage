import axiosInstance from "@/lib/axiosInstance";
import type { CurrentUser } from "@/types/user.types";

export const userService = {
	getCurrentUser: async (): Promise<CurrentUser> => {
		const res = await axiosInstance.get<CurrentUser>("/user");
		return res.data;
	},
};
