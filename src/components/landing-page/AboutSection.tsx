import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section id='about' className="py-12 md:py-16 lg:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="w-2 h-2 bg-purple-800 rounded-full mr-3"></div>
            <span className="text-purple-800 font-medium text-xs sm:text-sm uppercase tracking-wide">
              Discover PSA Card
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-900 mb-4 md:mb-6 px-2" style={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            lineHeight: '1.1',
            letterSpacing: '0%'
          }}>
            <span className="block">Trusted by Collectors Worldwide</span>
            <span className="block mt-1 md:mt-2">Inside the World of PSA</span>
          </h2>
          
          <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            <span className="block">Discover how PSA became the gold standard in authentication and grading.</span>
            <span className="block mt-2">With over 80 million items certified, we protect and elevate the legacy of trading cards and collectibles.</span>
          </p>
        </div>

        {/* Image Section */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl">
            {/* Background Image */}
            <img 
              src="/Why PSA.svg" 
              alt="PSA Card Authentication Process" 
              className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
            />
            
            {/* Mobile overlay gradient for better text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
          </div>
          
          {/* Decorative Elements - Hidden on mobile, scaled on tablet */}
          <div className="hidden sm:block">
            {/* Top left decoration */}
            <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 md:-top-4 md:-left-4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-blue-200 rounded-full opacity-60"></div>
            
            {/* Bottom right decoration */}
            <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 md:-bottom-6 md:-right-6 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 border-2 border-orange-200 rounded-full opacity-40"></div>
            
            {/* Side decoration */}
            <div className="absolute top-1/4 -right-3 sm:-right-4 md:-right-8 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-2 border-purple-200 rounded-full opacity-50"></div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default AboutSection;