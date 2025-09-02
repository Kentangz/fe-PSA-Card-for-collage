export const PATHS = {
	HOME: "/",
	PRODUCT_DETAIL: (serialNumber: string | number = ":serialNumber") =>
		`/product/${serialNumber}`,
	AUTH: {
		SIGNIN: "/signin",
		SIGNUP: "/signup",
		FORGOT: "/forgot-password",
		RESET: (token: string = ":token") => `/reset-password/${token}`,
	},
	DASHBOARD: {
		ROOT: "/dashboard",
		ADMIN: {
			ROOT: "/dashboard/admin",
			USERS: "/dashboard/admin/users",
			USER_DETAIL: (id: string = ":id") => `/dashboard/admin/users/${id}`,
			SUBMISSIONS: "/dashboard/admin/submissions",
			SUBMISSIONS_DONE: "/dashboard/admin/submissions/done",
			SUBMISSIONS_REJECTED: "/dashboard/admin/submissions/rejected",
			SUBMISSION_DETAIL: (id: string = ":id") =>
				`/dashboard/admin/submissions/${id}`,
		},
		USER: {
			ROOT: "/dashboard/user",
			SUBMISSIONS: "/dashboard/user/submissions",
			TRACKING: "/dashboard/user/tracking",
			TRACKING_DETAIL: (id: string = ":id") => `/dashboard/user/tracking/${id}`,
		},
	},
} as const;

