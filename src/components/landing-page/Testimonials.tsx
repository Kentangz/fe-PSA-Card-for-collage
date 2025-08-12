import React, { useState, useEffect, useRef } from 'react';

interface Testimonial {
  id: number;
  name: string;
  title: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Udin Jubaidin",
    title: "Collector, Investor & Community Organizer",
    content: "Before PSA, I struggled to find a grading service I could trust. But PSA changed everything. The submission process was smooth, the updates were timely, and the final reports were crystal clear.Most importantly, their name carries weight in the market — buyers recognize PSA grades and are willing to pay more. It's no exaggeration to say that PSA helped unlock the full potential of my card collection.",
    avatar: "⚡",
    rating: 5
  },
  {
    id: 2,
    name: "Gunawan Dwiyono",
    title: "Senior Collector & Investor",
    content: "Working with PSA Card has been a game changer for my collecting journey. From the very beginning, their team demonstrated a deep understanding of the collectibles market and took the time to tailor their process to my specific needs.The insights and grading results I received were not only incredibly detailed, but also helped me make smarter decisions around which cards to sell, keep, or invest in further. PSA didn't just provide a grade — they provided confidence, transparency, and professionalism at every step.",
    avatar: "🎯",
    rating: 5
  },
  {
    id: 3,
    name: "Salim Lestari", 
    title: "Marketplace Seller & Trading Card Enthusiast",
    content: "As a collector in Southeast Asia, I wasn't sure if PSA would be accessible. But not only was the process international-friendly, the support team was incredibly helpful. They guided me through shipping, customs, and the grading process step by step. When my cards came back, I was blown away by the precision and care in the packaging and documentation. I now encourage local collectors to use PSA if they're serious about building a premium, investment-grade collection",
    avatar: "⭐",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const autoSlideRef = useRef<number | null>(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto slide functionality
  useEffect(() => {
    const startAutoSlide = () => {
      autoSlideRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 6000);
    };

    const stopAutoSlide = () => {
      if (autoSlideRef.current !== null) {
        clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };

    startAutoSlide();
    
    return () => stopAutoSlide();
  }, []);

  const renderStars = (rating: number, isActive: boolean) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${isActive ? 'text-lg' : 'text-sm'} ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        style={{
          transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        ★
      </span>
    ));
  };

  return (
    <section id='testimonials' className="py-8 md:py-16" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-purple-800 font-medium text-sm md:text-base">Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4 md:mb-6 px-2" style={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            lineHeight: '1.2',
            letterSpacing: '0%'
          }}>
            Real Voices, Real Proof,<br />
            Trusted Results
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Hear from collectors and partners who've trusted PSA Card with grading and authentication services.
            We take pride in delivering high-precision results that elevate the value and trust in every collection.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-6xl mx-auto">
          {isMobile ? (
            // Mobile: Single card view with swipe
            <div className="flex justify-center">
              <div className="w-full max-w-sm px-4">
                <div
                  className="rounded-2xl text-white shadow-2xl border border-purple-500/20 transform transition-all duration-500 ease-in-out"
                  style={{
                    minHeight: '450px',
                    padding: '20px',
                    background: 'linear-gradient(137.3deg, #190E34 43.88%, #462895 106.22%)'
                  }}
                >
                  {/* Profile Avatar - Top */}
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-purple-400 to-blue-500">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="35" r="18" fill="#FFF" opacity="0.9"/>
                        <circle cx="50" cy="75" r="25" fill="#FFF" opacity="0.9"/>
                        <circle cx="42" cy="32" r="2" fill="#333"/>
                        <circle cx="58" cy="32" r="2" fill="#333"/>
                        <path d="M45 38 Q50 42 55 38" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-semibold text-base text-white" style={{
                        fontFamily: 'Inter Tight',
                        fontWeight: 600
                      }}>
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-xs text-purple-200 font-medium mt-1">
                        {testimonials[currentIndex].title}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <blockquote className="text-sm leading-relaxed text-white mb-6" style={{
                    fontFamily: 'Inter Tight',
                    minHeight: '250px'
                  }}>
                    {testimonials[currentIndex].content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
                        "{paragraph}"
                      </p>
                    ))}
                  </blockquote>

                  {/* Stars at bottom */}
                  <div className="flex justify-center mt-auto">
                    <div className="flex">
                      {renderStars(testimonials[currentIndex].rating, true)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (

            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center space-x-4 lg:space-x-8 w-full px-4 lg:px-8">
                {testimonials.map((testimonial, index) => {
                  const isActive = index === currentIndex;
                  const isPrev = index === (currentIndex - 1 + testimonials.length) % testimonials.length;
                  const isNext = index === (currentIndex + 1) % testimonials.length;

                  if (!isActive && !isPrev && !isNext) {
                    return null;
                  }

                  return (
                    <div
                      key={testimonial.id}
                      className={`transition-all duration-1000 ease-in-out cursor-pointer flex-shrink-0 ${
                        isActive
                          ? 'opacity-100 z-20'
                          : 'opacity-50 z-10 hover:opacity-70'
                      }`}
                      style={{
                        transform: isActive ? 'scale(1) translateY(0px)' : 'scale(0.85) translateY(10px)',
                        transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onClick={() => !isActive && setCurrentIndex(index)}
                    >
                      <div
                        className={`rounded-2xl transition-all duration-1000 ease-in-out transform ${
                          isActive
                            ? 'text-white shadow-2xl border border-purple-500/20'
                            : 'bg-white text-gray-900 shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-200'
                        }`}
                        style={{
                          width: window.innerWidth < 1024 ? '280px' : '350px',
                          height: window.innerWidth < 1024 ? '380px' : '420px',
                          padding: window.innerWidth < 1024 ? '20px' : '24px',
                          filter: isActive ? 'blur(0px) brightness(1)' : 'blur(0.5px) brightness(0.9)',
                          transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
                          background: isActive ? 'linear-gradient(137.3deg, #190E34 43.88%, #462895 106.22%)' : ''
                        }}
                      >
                        {/* Profile Avatar */}
                        <div className="flex items-start mb-4">
                          <div className={`${isActive ? 'w-10 h-10 lg:w-12 lg:h-12' : 'w-8 h-8 lg:w-10 lg:h-10'} rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-purple-400 to-blue-500`}
                            style={{
                              transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
                            }}>
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <circle cx="50" cy="35" r="18" fill="#FFF" opacity="0.9"/>
                              <circle cx="50" cy="75" r="25" fill="#FFF" opacity="0.9"/>
                              <circle cx="42" cy="32" r="2" fill="#333"/>
                              <circle cx="58" cy="32" r="2" fill="#333"/>
                              <path d="M45 38 Q50 42 55 38" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className={`font-semibold ${isActive ? 'text-base lg:text-lg' : 'text-sm lg:text-base'} ${
                              isActive ? 'text-white' : 'text-gray-900'
                            }`} style={{
                              fontFamily: 'Inter Tight',
                              fontWeight: 600,
                              transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
                            }}>
                              {testimonial.name}
                            </h4>
                          </div>
                        </div>

                        {/* Content */}
                        <blockquote className={`${isActive ? 'text-xs lg:text-sm' : 'text-xs'} leading-relaxed ${
                          isActive ? 'text-white' : 'text-gray-700'
                        } ${!isActive ? 'line-clamp-3 lg:line-clamp-4' : ''} mb-6`} style={{
                          fontFamily: 'Inter Tight',
                          transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
                          minHeight: isActive ? (window.innerWidth < 1024 ? '180px' : '200px') : '60px'
                        }}>
                          {isActive ? (
                            testimonial.content.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
                                "{paragraph}"
                              </p>
                            ))
                          ) : (
                            <p>"{testimonial.content.split('\n\n')[0]}..."</p>
                          )}
                        </blockquote>

                        {/* Bottom Section */}
                        <div className="flex items-end justify-between mt-auto">
                          <div className="flex-1">
                            <p className={`text-xs ${
                              isActive ? 'text-purple-200' : 'text-gray-600'
                            } font-medium`}
                              style={{
                                transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
                              }}>
                              {testimonial.title}
                            </p>
                          </div>
                          
                          <div className="flex items-center ml-4">
                            <div className="flex">
                              {renderStars(testimonial.rating, isActive)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-3 mt-8 md:mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-500 ease-in-out ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 scale-125 shadow-lg'
                    : 'bg-gray-300 hover:bg-purple-300 hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          {isMobile && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-500 font-medium">
                {currentIndex + 1} / {testimonials.length}
              </span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
                className="bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;