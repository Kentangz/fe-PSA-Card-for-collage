import React, { useEffect, useState } from 'react';

const CTA: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const mobileCardPositions = [
    {
      style: {
        position: 'absolute' as const,
        top: '20px',
        left: '10px',
        width: '120px',
        height: '120px',
        transform: `rotate(-8deg) scale(${animationPhase === 0 ? 1.1 : 0.9})`,
        zIndex: animationPhase === 0 ? 20 : 5,
        opacity: animationPhase === 0 ? 1 : 0.6,
      }
    },
    {
      style: {
        position: 'absolute' as const,
        top: '20px',
        right: '10px',
        width: '140px',
        height: '140px',
        transform: `rotate(5deg) scale(${animationPhase === 1 ? 1.1 : 0.9})`,
        zIndex: animationPhase === 1 ? 20 : 5,
        opacity: animationPhase === 1 ? 1 : 0.6,
      }
    },
    {
      style: {
        position: 'absolute' as const,
        bottom: '20px',
        left: '10px',
        width: '130px',
        height: '130px',
        transform: `rotate(2deg) scale(${animationPhase === 2 ? 1.1 : 0.9})`,
        zIndex: animationPhase === 2 ? 20 : 5,
        opacity: animationPhase === 2 ? 1 : 0.6,
      }
    },
    {
      style: {
        position: 'absolute' as const,
        bottom: '20px',
        right: '10px',
        width: '110px',
        height: '90px',
        transform: `rotate(-5deg) scale(${animationPhase === 3 ? 1.1 : 0.9})`,
        zIndex: animationPhase === 3 ? 20 : 5,
        opacity: animationPhase === 3 ? 1 : 0.6,
      }
    }
  ];

  const desktopCardPositions = [
    {
      style: {
        position: 'absolute' as const,
        top: '100px',
        left: '102px',
        width: '300px',
        height: '300px',
        transform: `rotate(-8.57deg) scale(${animationPhase === 0 ? 1.05 : 1})`,
        zIndex: animationPhase === 0 ? 20 : 10,
      }
    },
    {
      style: {
        position: 'absolute' as const,
        top: '100px',
        right: '-30px',
        width: '378px',
        height: '378px',
        transform: `rotate(-1.25deg) scale(${animationPhase === 1 ? 1.05 : 1})`,
        zIndex: animationPhase === 1 ? 20 : 10,
      }
    },
    {
      style: {
        position: 'absolute' as const,
        bottom: '-35px',
        left: '102px',
        width: '369px',
        height: '369px',
        transform: `rotate(1.82deg) scale(${animationPhase === 2 ? 1.05 : 1})`,
        zIndex: animationPhase === 2 ? 20 : 10,
      }
    },
    {
      style: {
        position: 'absolute' as const,
        bottom: '-5px',
        right: '102px',
        width: '300px',
        height: '244px',
        transform: `rotate(-5deg) scale(${animationPhase === 3 ? 1.05 : 1})`,
        zIndex: animationPhase === 3 ? 20 : 10,
      }
    }
  ];

  const cardPositions = isMobile ? mobileCardPositions : desktopCardPositions;

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #2D1B69 0%, #1A0B3D 50%, #0F051F 100%)',
      minHeight: isMobile ? '500px' : '600px'
    }}>
      {/* Floating Card Images */}
      {[1, 2, 3, 4].map((cardNum, index) => (
        <div
          key={cardNum}
          className="transition-all duration-1000 ease-out"
          style={{
            ...cardPositions[index].style,
            filter: animationPhase === index ? 'brightness(1.1) drop-shadow(0 10px 30px rgba(0,0,0,0.3))' : 'brightness(0.9)',
          }}
        >
          <img
            src={`/CTAcard${cardNum}.svg`}
            alt={`Dragon Shield Card ${cardNum}`}
            className="w-full h-full object-contain"
            style={{
              transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      ))}

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-purple-900/30 md:from-purple-900/20 md:to-purple-900/20"></div>

      {/* Content Container - Centered in section */}
      <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center h-full ${isMobile ? 'min-h-[500px]' : 'min-h-[600px]'}`}>
        {/* Main Heading */}
        <h2 className="mb-6 md:mb-8 px-2" style={{
          fontFamily: 'Inter Tight',
          fontWeight: 500,
          fontSize: isMobile ? '28px' : window.innerWidth < 1024 ? '36px' : '48px',
          lineHeight: isMobile ? '34px' : window.innerWidth < 1024 ? '42px' : '56px',
          letterSpacing: '0%',
          textAlign: 'center',
          background: 'linear-gradient(185.28deg, #FFFFFF 4.78%, #323232 148.98%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none'
        }}>
          <span className="block">Turn Your Cards into</span>
          <span className="block mt-1">Certified Assets</span>
        </h2>

        {/* CTA Button */}
        <div className="relative inline-block">
          <button className="group relative px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold text-base md:text-lg rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 hover:from-orange-400 hover:to-yellow-400">
            <span className="relative z-10 flex items-center gap-2">
              <span className="hidden sm:inline">Check Your Card's Value</span>
              <span className="sm:hidden">Check Card Value</span>
              <svg 
                className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            
            {/* Button Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Decorative Elements - Simplified for mobile */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Floating Particles - Reduced on mobile */}
        {!isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-40 animate-ping"></div>
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-30 animate-bounce"></div>
            
            <div className="absolute top-1/6 right-1/5 w-1.5 h-1.5 bg-white rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/6 w-2 h-2 bg-yellow-300 rounded-full opacity-45 animate-ping" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-orange-300 rounded-full opacity-35 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/6 right-1/6 w-2.5 h-2.5 bg-purple-300 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-2/3 left-1/8 w-1 h-1 bg-pink-400 rounded-full opacity-40 animate-ping" style={{ animationDelay: '3s' }}></div>
          </>
        )}
        
        {/* Mobile simplified particles */}
        {isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-400 rounded-full opacity-40 animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-orange-400 rounded-full opacity-30 animate-ping"></div>
            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-purple-400 rounded-full opacity-20 animate-bounce"></div>
          </>
        )}

        {/* Moving Sparkles - Scaled for mobile */}
        <div className={`absolute top-1/5 left-3/4 ${isMobile ? 'w-2 h-2' : 'w-4 h-4'} opacity-20`} style={{ 
          animation: 'float 4s ease-in-out infinite',
          animationDelay: '0s'
        }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
        </div>
        
        <div className={`absolute bottom-1/5 left-1/5 ${isMobile ? 'w-1.5 h-1.5' : 'w-3 h-3'} opacity-15`} style={{ 
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '2s'
        }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-orange-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
        </div>
        
        <div className={`absolute top-3/5 right-1/8 ${isMobile ? 'w-1 h-1' : 'w-2 h-2'} opacity-25`} style={{ 
          animation: 'float 5s ease-in-out infinite',
          animationDelay: '1s'
        }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-purple-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
        </div>
        
        {/* Gradient Orbs - Scaled for mobile */}
        <div className={`absolute -top-12 -right-12 ${isMobile ? 'w-24 h-24' : 'w-48 h-48'} bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-3xl opacity-20`}></div>
        <div className={`absolute -bottom-12 -left-12 ${isMobile ? 'w-32 h-32' : 'w-64 h-64'} bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full blur-3xl opacity-15`}></div>
        
        {!isMobile && (
          <>
            <div className="absolute top-1/2 -left-32 w-40 h-40 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-2xl opacity-10"></div>
            <div className="absolute bottom-1/4 -right-32 w-56 h-56 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-12"></div>
            
            {/* Geometric Shapes */}
            <div className="absolute top-1/8 left-1/12 w-6 h-6 border border-white/20 rotate-45 opacity-30" style={{
              animation: 'spin 10s linear infinite'
            }}></div>
            <div className="absolute bottom-1/8 right-1/12 w-4 h-4 border border-yellow-400/30 rotate-12 opacity-40" style={{
              animation: 'spin 8s linear infinite reverse'
            }}></div>
            <div className="absolute top-1/2 left-1/20 w-5 h-5 border border-orange-400/25 rotate-45 opacity-25" style={{
              animation: 'spin 12s linear infinite'
            }}></div>
            
            {/* Glowing Lines */}
            <div className="absolute top-1/3 left-0 w-32 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-60" style={{
              animation: 'fadeInOut 3s ease-in-out infinite',
              animationDelay: '1s'
            }}></div>
            <div className="absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-l from-transparent via-orange-400/30 to-transparent opacity-50" style={{
              animation: 'fadeInOut 4s ease-in-out infinite',
              animationDelay: '2s'
            }}></div>
          </>
        )}
        
        {/* Additional Orbs for Depth - Scaled */}
        <div className={`absolute top-1/6 right-1/3 ${isMobile ? 'w-10 h-10' : 'w-20 h-20'} bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-xl opacity-80`}></div>
        <div className={`absolute bottom-1/3 left-1/4 ${isMobile ? 'w-16 h-16' : 'w-32 h-32'} bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-2xl opacity-70`}></div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
          }
          @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </section>
  );
};

export default CTA;