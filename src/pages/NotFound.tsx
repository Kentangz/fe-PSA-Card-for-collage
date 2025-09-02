import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="inline-block bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-6 rounded-full font-medium transition-all duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;

