// src/types/admindashboard.ts

export interface User {
	id: number;
	name: string;
	email: string;
	phone_number: string;
	role: string;
	email_verified_at: string | null;
	is_active: number;
	created_at: string;
	updated_at: string;
}

export interface Submission {
	id: string | number;
	name: string;
	year: string | number;
	brand: string;
	serial_number: string;
	grade_target: string;
	created_at: string;
	latest_status: {
		status: string;
	};
}

export interface MonthlyData {
	month: string;
	submissions: number;
	users: number;
}

export interface StatsCards {
	totalSubmissions: number;
	submittedCards: number;
	acceptedCards: number;
	onProcessCards: number;
	doneCards: number;
	totalUsers: number;
	newUsersThisMonth: number;
}

export interface DashboardStatsProps {
	onStatsLoad?: (stats: StatsCards) => void;
}
