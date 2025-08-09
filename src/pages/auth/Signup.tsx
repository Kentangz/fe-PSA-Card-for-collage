import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FieldInput from "../../components/FieldInput";
import LeftPanel from "../../components/LeftPanel";
import { API_URL } from "../../lib/api";

interface ValidationErrors {
  [key: string]: string;
}

const Signup: React.FC = () => {
  const [error, setError] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("+62");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError({});

    const user = {
      name,
      email,
      phone_number: phoneNumber,
      password,
      password_confirmation: passwordConfirmation,
    };

    try {
      const response = await axios.post(`${API_URL}/register`, user);
      if (response.data) {
        navigate("/signin");
      }
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data?: { errors?: ValidationErrors; message?: string } } };
      if (error?.response) {
        if (error.response.status === 422) {
          setError(error.response.data?.errors || {});
        } else {
          setError({ general: error.response.data?.message || "Registration failed" });
        }
      } else {
        setError({ general: "Network error. Please check your connection." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <LeftPanel />
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">for PSA Card</h3>
            <p className="text-gray-500">
              Fill in the information below to create your account
            </p>
          </div>

          {error.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error.general}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <FieldInput 
                type="text" 
                placeholder="Enter your name" 
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
              {error.name && (
                <p className="mt-1 text-sm text-red-600">{error.name}</p>
              )}
            </div>

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
              {error.email && (
                <p className="mt-1 text-sm text-red-600">{error.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <FieldInput 
                type="text" 
                placeholder="Enter phone number" 
                name="phone_number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required 
              />
              {error.phone_number && (
                <p className="mt-1 text-sm text-red-600">{error.phone_number}</p>
              )}
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
              {error.password && (
                <p className="mt-1 text-sm text-red-600">{error.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <FieldInput 
                type="password" 
                placeholder="Confirm password" 
                name="password_confirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required 
              />
              {error.password_confirmation && (
                <p className="mt-1 text-sm text-red-600">{error.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-full font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Already have an account?{" "}
            <Link 
              to="/signin" 
              className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              Sign In
            </Link>
          </p>

          <div className="mt-10 flex justify-center gap-6 text-sm text-purple-600">
            <Link to="#" className="hover:text-purple-700 transition-colors">Shipping</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Help</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Product Policy</Link>
            <Link to="#" className="hover:text-purple-700 transition-colors">Return</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;