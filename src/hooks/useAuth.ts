import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register,forgotPassword,resetPassword } from "../services/authService";

interface LoginCredentials {
	email: string;
	password: string;
}

interface RegisterCredentials {
	name: string;
	email: string;
	phone_number: string;
	password: string;
	password_confirmation: string;
}

interface ForgotPasswordCredentials {
  email: string;
}

interface ResetPasswordCredentials {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const useAuth = () => {
	const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const navigate = useNavigate();

	const signIn = async (credentials: LoginCredentials) => {
		setLoading(true);
		setError(null);
		try {
			await login(credentials);
			navigate("/dashboard");
			return true; // Berhasil
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred.");
			}
			return false;
		} finally {
			setLoading(false);
		}
  };
      const signUp = async (credentials: RegisterCredentials) => {
			setLoading(true);
			setError(null);
			try {
				await register(credentials);
				navigate("/signin", {
					state: {
						message: "Registration successful! Please sign in.",
					},
				});
				return true;
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("An unexpected error occurred during registration.");
				}
				return false;
			} finally {
				setLoading(false);
			}
  };

    const sendPasswordResetLink = async (
			credentials: ForgotPasswordCredentials
		) => {
			setLoading(true);
			setError(null);
			setSuccessMessage(null);
			try {
				const response = await forgotPassword(credentials);
				setSuccessMessage(response.status);
				return true;
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("An unexpected error occurred.");
				}
				return false;
			} finally {
				setLoading(false);
			}
  };
  
    const performPasswordReset = async (
			credentials: ResetPasswordCredentials
		) => {
			setLoading(true);
			setError(null);
			try {
				await resetPassword(credentials);
				navigate("/signin", {
					state: {
						message: "Password has been reset successfully. Please sign in.",
					},
				});
				return true;
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("An unexpected error occurred.");
				}
				return false;
			} finally {
				setLoading(false);
			}
		};

	return { signIn,signUp,sendPasswordResetLink,performPasswordReset, loading, error, successMessage };
};
