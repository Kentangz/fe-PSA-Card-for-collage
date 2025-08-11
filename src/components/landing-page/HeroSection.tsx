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

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 6000); // Change slide every 6 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <>
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
        `}
      </style>
      
      <section className="relative h-screen min-h-[600px] overflow-hidden" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${currentSlideData.background})`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Content */}
              <div className="text-white space-y-6 lg:space-y-0 order-2 lg:order-1">
                {/* Card Image - Above Title */}
                <div className="flex justify-center lg:justify-start mb-0">
                  <img
                    src={currentSlideData.card}
                    alt="Trading Card"
                    className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto object-contain drop-shadow-2xl opacity-0 animate-fade-in hover:scale-105 transition-transform duration-300"
                    key={`card-${currentSlide}`}
                    style={{
                      animation: 'fadeIn 1000ms ease-out forwards'
                    }}
                  />
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h1 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl leading-tight opacity-0"
                    style={{
                      animation: 'fadeIn 1000ms ease-out 200ms forwards',
                      fontFamily: 'Inter Tight',
                      fontWeight: 500,
                      lineHeight: '72px',
                      letterSpacing: '0%'
                    }}
                  >
                    <span className="block">{currentSlideData.title}</span>
                    <span className="block text-gray-200">{currentSlideData.subtitle}</span>
                    {currentSlide === 0 && <span className="block text-gray-300">Empowering Collectors</span>}
                  </h1>
                </div>

                {/* Description */}
                <p 
                  className="text-base sm:text-sm lg:text-xl text-gray-200 max-w-2xl leading-relaxed opacity-0"
                  style={{
                    animation: 'fadeIn 1000ms ease-out 400ms forwards'
                  }}
                >
                  {currentSlideData.description}
                </p>

                {/* CTA Button */}
                <div 
                  className="pt-4 opacity-0"
                  style={{
                    animation: 'fadeIn 1000ms ease-out 600ms forwards'
                  }}
                >
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 lg:px-10 lg:py-5 rounded-full text-lg lg:text-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105">
                    {currentSlideData.buttonText}
                  </button>
                </div>
              </div>

              {/* Right Content - Empty on Desktop for single column layout */}
              <div className="hidden lg:block order-1 lg:order-2">
                {/* Empty space for layout balance */}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 lg:p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 lg:p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-white scale-125'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-8 right-8 z-20 text-white/80 text-sm lg:text-base font-medium">
          {currentSlide + 1} / {slides.length}
        </div>
      </section>
    </>
  );
};

export default HeroSection;