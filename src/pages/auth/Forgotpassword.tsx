import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import FieldInput from "@/components/FieldInput";
import AuthLayout from "@/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";

const ForgotPassword: React.FC = () => {
  const { sendPasswordResetLink, loading, error, successMessage } = useAuth();
  
  const [email, setEmail] = useState<string>("");

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendPasswordResetLink({ email });
  };

  return (
    <AuthLayout>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">for PSA Card</h3>
            <p className="text-gray-500">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <FieldInput 
                type="email" 
                placeholder="Enter your email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-full font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <Link 
              to={PATHS.AUTH.SIGNIN}
              className="text-purple-600 font-medium hover:text-purple-700 transition-colors block"
            >
              ← Back to Sign In
            </Link>
            
            <p className="text-gray-500">
              Don't have an account?{" "}
              <Link 
                to={PATHS.AUTH.SIGNUP}
                className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-10 flex justify-center gap-6 text-sm text-purple-600">
            <Link to="#" className="hover:text-purple-700 transition-colors">Shipping</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Help</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Product Policy</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Return</Link>
          </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
 