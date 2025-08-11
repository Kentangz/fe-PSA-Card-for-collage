import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            <span className="text-blue-600 font-medium text-sm uppercase tracking-wide">
              Discover PSA Card
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl text-gray-900 mb-6" style={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            lineHeight: '72px',
            letterSpacing: '0%'
          }}>
            Trusted by Collectors Worldwide<br />
            Inside the World of PSA
          </h2>
          
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover how PSA became the gold standard in authentication and grading.<br />
            With over 80 million items certified, we protect and elevate the legacy of trading cards and collectibles.
          </p>
        </div>

        {/* Image Section */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            {/* Background Image */}
            <img 
              src="/Why PSA.svg" 
              alt="PSA Card Authentication Process" 
              className="w-full h-[500px] object-cover"
            />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-blue-200 rounded-full opacity-60"></div>
          <div className="absolute -bottom-6 -right-6 w-12 h-12 border-2 border-orange-200 rounded-full opacity-40"></div>
          <div className="absolute top-1/4 -right-8 w-6 h-6 border-2 border-purple-200 rounded-full opacity-50"></div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;