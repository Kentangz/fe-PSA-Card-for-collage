import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/Logo.svg"
              alt="PSA"
              className="h-8 w-auto sm:h-10 lg:h-12"
            />
          </div>

          {/* Desktop Navigation Menu - Hidden on mobile/tablet, shown on large screens */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-6 xl:space-x-8">
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap"
              >
                All Categories
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap"
              >
                Our PSA Journey
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap"
              >
                Testimonials
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap"
              >
                FAQ
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap"
              >
                About Us
              </a>
            </div>
          </div>

          {/* Desktop Start Submission Button */}
          <div className="hidden lg:block">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 xl:px-6 xl:py-3 rounded-full text-sm xl:text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap">
              Start Submission
            </button>
          </div>

          {/* Tablet Start Submission Button - Hidden on mobile, shown on tablet only */}
          <div className="hidden md:block lg:hidden">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
              Start Submission
            </button>
          </div>

          {/* Mobile & Tablet menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger/Close icon */}
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-3 space-y-1 sm:px-6 bg-white border-t border-gray-200 shadow-lg">
          <a
            href="#"
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 text-base font-medium transition-colors duration-200 rounded-md"
          >
            All Categories
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 text-base font-medium transition-colors duration-200 rounded-md"
          >
            Our PSA Journey
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 text-base font-medium transition-colors duration-200 rounded-md"
          >
            Testimonials
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 text-base font-medium transition-colors duration-200 rounded-md"
          >
            FAQ
          </a>
          <a
            href="#"
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-4 py-3 text-base font-medium transition-colors duration-200 rounded-md"
          >
            About Us
          </a>
          
          {/* Mobile Start Submission Button - Only shown on mobile */}
          <div className="px-4 py-4 md:hidden">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg">
              Start Submission
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;