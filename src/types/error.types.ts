export interface AxiosError {
	isAxiosError: true;
	response?: {
		status?: number;
		data?: {
			message?: string;
		};
	};
}
