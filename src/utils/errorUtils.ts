import type { AxiosError } from "../types/error.types";

export function isAxiosError(error: unknown): error is AxiosError {
	return (
		typeof error === "object" &&
		error !== null &&
		"isAxiosError" in error &&
		(error as { isAxiosError?: boolean }).isAxiosError === true
	);
}
