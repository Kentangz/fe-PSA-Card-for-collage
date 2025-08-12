import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/Logo.svg"
              alt="PSA Logo"
              className="h-8 w-auto sm:h-10 lg:h-12 transition-all duration-200"
            />
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-4 xl:space-x-6 2xl:space-x-8">
              <a
                href="#"
                className="text-gray-700 hover:text-purple-800 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap relative group"
              >
                All Categories
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-800 group-hover:w-full transition-all duration-200"></span>
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-purple-800 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap relative group"
              >
                Our PSA Journey
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-800 group-hover:w-full transition-all duration-200"></span>
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-purple-800 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap relative group"
              >
                Testimonials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-800 group-hover:w-full transition-all duration-200"></span>
              </a>
              <a
                href="#faq"
                className="text-gray-700 hover:text-purple-800 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap relative group"
              >
                FAQ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-800 group-hover:w-full transition-all duration-200"></span>
              </a>
              <a
                href="#footer"
                className="text-gray-700 hover:text-purple-800 px-3 py-2 text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap relative group"
              >
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-800 group-hover:w-full transition-all duration-200"></span>
              </a>
            </div>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden lg:block">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 xl:px-6 xl:py-3 rounded-full text-sm xl:text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 transform whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              Start Submission
            </button>
          </div>

          {/* Tablet CTA Button */}
          <div className="hidden md:block lg:hidden">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 transform whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              Start Submission
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="bg-gray-50 hover:bg-gray-100 inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {/* Animated hamburger icon */}
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-4 space-y-1 sm:px-6 bg-white border-t border-gray-100 shadow-lg">
          <a
            href="#categories"
            onClick={closeMobileMenu}
            className="text-gray-700 hover:text-purple-800 hover:bg-purple-50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg border-l-4 border-transparent hover:border-purple-800"
          >
            All Categories
          </a>
          <a
            href="#about"
            onClick={closeMobileMenu}
            className="text-gray-700 hover:text-purple-800 hover:bg-purple-50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg border-l-4 border-transparent hover:border-purple-800"
          >
            Our PSA Journey
          </a>
          <a
            href="#testimonials"
            onClick={closeMobileMenu}
            className="text-gray-700 hover:text-purple-800 hover:bg-purple-50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg border-l-4 border-transparent hover:border-purple-800"
          >
            Testimonials
          </a>
          <a
            href="#faq"
            onClick={closeMobileMenu}
            className="text-gray-700 hover:text-purple-800 hover:bg-purple-50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg border-l-4 border-transparent hover:border-purple-800"
          >
            FAQ
          </a>
          <a
            href="#footer"
            onClick={closeMobileMenu}
            className="text-gray-700 hover:text-purple-800 hover:bg-purple-50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg border-l-4 border-transparent hover:border-purple-800"
          >
            About Us
          </a>
          
          {/* Mobile CTA Button */}
          <div className="px-4 pt-4 md:hidden">
            <button 
              onClick={closeMobileMenu}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-full text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Start Submission
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;