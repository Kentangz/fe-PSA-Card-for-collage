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
    name: "Gunawan Dwiyono",
    title: "Senior Collector & Investor",
    content: "Working with PSA Card has been a game changer for my collecting journey. From the very beginning, their team demonstrated a deep understanding of the collectibles market and took the time to tailor their process to my specific needs.\n\nThe insights and grading results I received were not only incredibly detailed, but also helped me make smarter decisions around which cards to sell, keep, or invest in further. PSA didn't just provide a grade — they provided confidence, transparency, and professionalism at every step.",
    avatar: "⚡",
    rating: 5
  },
  {
    id: 2,
    name: "Salim Lestari",
    title: "Marketplace Seller & Trading Card Enthusiast",
    content: "As a collector in Southeast Asia, I needed a grading service that was both reliable and accessible. But not only was the process smooth and user-friendly, the support team was incredibly helpful and guided me through shipping, customs, and the entire process step by step.\n\nWhen my cards came back, I was blown away by the precision and care in the packaging. I now encourage local collectors to trust PSA about building a premium, investment-grade collection.",
    avatar: "🎯",
    rating: 5
  },
  {
    id: 3,
    name: "David Martinez", 
    title: "Card Grading Specialist",
    content: "I needed to find a grading service I could trust. The submission process was streamlined and user-friendly. The final reports were comprehensive and timely, and the final reports were professional.\n\nSome carries weight in the market — collectors trust PSA grades and are willing to pay more. It's clear that PSA helped unlock the full market value of my collection.",
    avatar: "⭐",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with middle testimonial
  const autoSlideRef = useRef<number | null>(null);

  // Auto slide functionality
  useEffect(() => {
    const startAutoSlide = () => {
      autoSlideRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 6000); // Slower auto-slide for better fade experience
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
        className={`${isActive ? 'text-lg' : 'text-base'} ${
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
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-purple-600 font-medium">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-6" style={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            lineHeight: '72px',
            letterSpacing: '0%'
          }}>
            Real Voices, Real Proof,<br />
            Trusted Results
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Hear from collectors and partners who've trusted PSA Card with grading and authentication services.
            We take pride in delivering high-precision results that elevate the value and trust in every collection.
          </p>
        </div>

        {/* Testimonials Carousel - Horizontal Flow */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-center">
            {/* Testimonials Container - Horizontal stack showing 3 testimonials */}
            <div className="flex items-center justify-center space-x-8 w-full px-8">
              {testimonials.map((testimonial, index) => {
                const isActive = index === currentIndex;
                const isPrev = index === (currentIndex - 1 + testimonials.length) % testimonials.length;
                const isNext = index === (currentIndex + 1) % testimonials.length;

                // Only show current, previous, and next
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
                      transform: isActive ? 'scale(1) translateY(0px)' : 'scale(0.9) translateY(10px)',
                      transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onClick={() => !isActive && setCurrentIndex(index)}
                  >
                    <div
                      className={`rounded-2xl transition-all duration-1000 ease-in-out transform ${
                        isActive
                          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 text-white shadow-2xl border border-purple-500/20'
                          : 'bg-white text-gray-900 shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-200'
                      }`}
                      style={{
                        width: '380px',
                        height: '420px',
                        padding: '24px',
                        filter: isActive ? 'blur(0px) brightness(1)' : 'blur(0.5px) brightness(0.9)',
                        transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {/* Profile Avatar - Top Left */}
                      <div className="flex items-start mb-4">
                        <div className={`${isActive ? 'w-12 h-12' : 'w-10 h-10'} rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-purple-400 to-blue-500`}
                          style={{
                            transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
                          }}>
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Animated Profile Avatar */}
                            <circle cx="50" cy="35" r="18" fill="#FFF" opacity="0.9"/>
                            <circle cx="50" cy="75" r="25" fill="#FFF" opacity="0.9"/>
                            <circle cx="42" cy="32" r="2" fill="#333"/>
                            <circle cx="58" cy="32" r="2" fill="#333"/>
                            <path d="M45 38 Q50 42 55 38" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className={`font-semibold ${isActive ? 'text-lg' : 'text-base'} ${
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
                      <blockquote className={`${isActive ? 'text-sm' : 'text-xs'} leading-relaxed ${
                        isActive ? 'text-white' : 'text-gray-700'
                      } ${!isActive ? 'line-clamp-4' : ''} mb-6`} style={{
                        fontFamily: 'Inter Tight',
                        transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
                        minHeight: isActive ? '200px' : '80px'
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

                      {/* Bottom Section - Job Title Left, Stars Right */}
                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex-1">
                          <p className={`${isActive ? 'text-xs' : 'text-xs'} ${
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

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-3 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 scale-125 shadow-lg'
                    : 'bg-gray-300 hover:bg-purple-300 hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;