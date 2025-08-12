import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: number;
  background: string;
  card: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
}

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: HeroSlide[] = [
    {
      id: 1,
      background: '/BackgroundLP1.svg',
      card: '/Card1.svg',
      title: 'Authenticating Collectibles,',
      subtitle: 'Preserving Value,',
      description: 'Trusted by millions, we certify trading cards and memorabilia with precision and integrity — ensuring your collectibles are verified, graded, and valued for generations.',
      buttonText: 'Start Your Submission'
    },
    {
      id: 2,
      background: '/BackgroundLP2.svg',
      card: '/Card2.svg',
      title: 'Your Cards Deserve the Gold Standard',
      subtitle: 'in Grading',
      description: 'From vintage classics to modern hits, PSA helps preserve the legacy of your collection with industry-leading authentication and secure encapsulation.',
      buttonText: 'Grade with Confidence'
    },
    {
      id: 3,
      background: '/BackgroundLP3.svg',
      card: '/Card3.svg',
      title: 'Protect Your Holiday Pulls',
      subtitle: 'with PSA',
      description: 'Give your rare finds the gift of lasting value — authenticated, graded, and ready for the spotlight.',
      buttonText: 'Submit Holiday Cards'
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play
  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <div id='#'>
      {/* Google Fonts Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />
      
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @media (max-width: 768px) {
            .mobile-hero {
              min-height: 100vh;
              min-height: 100dvh; /* Dynamic viewport height for mobile */
            }
          }
        `}
      </style>
      
      <section className="relative mobile-hero h-screen min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] xl:min-h-screen overflow-hidden" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${currentSlideData.background})`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50 sm:bg-black/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="flex flex-col items-center text-center lg:text-left lg:items-start lg:max-w-4xl">
              
              {/* Card Image */}
              <div className="flex justify-center lg:justify-start mb-4 sm:mb-6 lg:mb-8">
                <img
                  src={currentSlideData.card}
                  alt="Trading Card"
                  className="w-24 h-auto sm:w-32 md:w-40 lg:w-48 xl:w-56 object-contain drop-shadow-2xl opacity-0 animate-fade-in hover:scale-105 transition-transform duration-300"
                  key={`card-${currentSlide}`}
                  style={{
                    animation: 'fadeIn 1000ms ease-out forwards'
                  }}
                />
              </div>

              {/* Title */}
              <div className="space-y-1 mb-4 sm:mb-6 lg:mb-8">
                <h1 
                  className="text-white opacity-0 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight"
                  style={{
                    animation: 'fadeIn 1000ms ease-out 200ms forwards',
                    fontFamily: 'Inter Tight',
                    fontWeight: 500,
                    lineHeight: '1.2'
                  }}
                >
                  <span className="block">{currentSlideData.title}</span>
                  <span className="block text-gray-100 sm:text-gray-200">{currentSlideData.subtitle}</span>
                  {currentSlide === 0 && <span className="block text-gray-200 sm:text-gray-300">Empowering Collectors</span>}
                </h1>
              </div>

              {/* Description */}
              <p 
                className="text-gray-100 sm:text-gray-200 opacity-0 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed sm:leading-relaxed lg:leading-relaxed max-w-lg sm:max-w-xl lg:max-w-2xl mb-6 sm:mb-8 lg:mb-10"
                style={{
                  animation: 'fadeIn 1000ms ease-out 400ms forwards'
                }}
              >
                {currentSlideData.description}
              </p>

              {/* CTA Button */}
              <div 
                className="opacity-0"
                style={{
                  animation: 'fadeIn 1000ms ease-out 600ms forwards'
                }}
              >
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-full text-base sm:text-lg lg:text-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 active:scale-95">
                  {currentSlideData.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 active:bg-black/70 text-white p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm touch-manipulation"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 active:bg-black/70 text-white p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm touch-manipulation"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 touch-manipulation ${
                currentSlide === index
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/70 active:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 z-20 text-white/90 text-xs sm:text-sm lg:text-base font-medium bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5">
          {currentSlide + 1} / {slides.length}
        </div>
      </section>
    </div>
  );
};

export default HeroSection;