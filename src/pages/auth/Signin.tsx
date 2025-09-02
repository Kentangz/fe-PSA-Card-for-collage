import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FieldInput from "@/components/FieldInput";
import AuthLayout from "@/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/routes/paths";

const Signin: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signIn({ email, password });
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">to PSA Card</h3>
            <p className="text-gray-500">
              Sign in or create an account by entering your email below
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSignin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <FieldInput 
                type="email" 
                placeholder="Enter email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <FieldInput 
                type="password" 
                placeholder="Enter password" 
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="flex justify-end">
              <Link 
                to={PATHS.AUTH.FORGOT}
                className="text-purple-600 text-sm hover:text-purple-700 font-medium transition-colors"
              >
                Forgot the password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-full font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Don't have an account?{" "}
            <Link 
              to={PATHS.AUTH.SIGNUP}
              className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              Sign Up
            </Link>
          </p>
          <div className="mt-10 flex justify-center gap-6 text-sm text-purple-600">
            <Link to="#" className="hover:text-purple-700 transition-colors">Shipping</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Help</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Product Policy</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Return</Link>
          </div>
    </AuthLayout>
  );
};

export default Signin;