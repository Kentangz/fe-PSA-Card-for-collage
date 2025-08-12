import { ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer id='footer' className="bg-gray-900 text-white">
      {/* CTA Section with Background */}
      <div 
        className="relative px-4 sm:px-6 py-12 md:py-16 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/FooterBg.svg')",
          backgroundColor: '#2D1B69'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium mb-4 md:mb-6" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                <span 
                  className="text-transparent bg-clip-text block"
                  style={{ 
                    background: 'linear-gradient(259.96deg, #FFFFFF 20.15%, #FF9F4D 120.95%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text'
                  }}
                >
                  <span className="block">Ready to Authenticate</span>
                  <span className="block">and Grade Your</span>
                </span>
                <br className="hidden md:block" />
                <span 
                  className="inline-block text-white transition-all duration-500 ease-out mt-2 md:mt-4"
                  style={{
                    width: window.innerWidth < 768 ? 'auto' : '441px',
                    minWidth: window.innerWidth < 768 ? '200px' : 'auto',
                    height: window.innerWidth < 768 ? '50px' : '80px',
                    borderRadius: window.innerWidth < 768 ? '50px' : '80px',
                    backgroundColor: '#462895',
                    padding: window.innerWidth < 768 ? '8px 20px' : '4px 24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(1deg)',
                    cursor: 'pointer',
                    fontSize: window.innerWidth < 768 ? '1rem' : 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(-3.03deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(1deg)';
                  }}
                >
                  Collectibles?
                </span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed px-2 lg:px-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                Submit your collectibles with confidence and access world-class grading and 
                authentication services. From submission to final encapsulation, PSA ensures 
                accuracy, security, and peace of mind.
              </p>
            </div>
            
            <div className="flex flex-shrink-0 w-full lg:w-auto justify-center lg:justify-end">
              <div className="flex items-center gap-0">
                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 sm:px-7 py-2 sm:py-3 rounded-full font-medium transition-colors duration-200 text-sm sm:text-base">
                  <span>Join PSA</span>
                </button>
                <button className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-1 py-1 rounded-full font-medium transition-colors duration-200">
                  <div className="flex items-center bg-orange bg-opacity-100 rounded-full p-2">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-315" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="bg-gray-900 px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">

            <div className="sm:col-span-2 lg:col-span-2">
              <div className="mb-6">
                <img 
                  src="/LogoTheos.svg" 
                  alt="THEOS PRO SUPPLIES" 
                  className="h-12 sm:h-16 mb-4"
                />
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                PSA (Professional Sports Authenticator) is the world's leading third-party 
                authentication and grading service for trading cards, memorabilia, and more. 
                With over 80 million items certified, we help collectors protect and value 
                their most prized assets.
              </p>
              <button className="flex items-center gap-2 text-white px-4 sm:px-6 py-2 sm:py-3 bg-[#462895] hover:bg-purple-900 rounded-full font-medium transition-colors duration-200 text-sm">
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform rotate-315" />
              </button>
            </div>

            {/* About PSA */}
            <div className="lg:self-start lg:justify-self-end">
              <h3 className="font-semibold text-base sm:text-lg mb-4" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                About PSA
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">PSA Services</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Our Standards</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">PSA Vault</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">News & Updates</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="lg:self-start lg:justify-self-end">
              <h3 className="font-semibold text-base sm:text-lg mb-4" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                Resources
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Cert Verification</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Population Report</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Price Guide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Set Registry</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">SecureScan</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="lg:self-start lg:justify-self-end">
              <h3 className="font-semibold text-base sm:text-lg mb-4" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                Support
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">How to Submit</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Turnaround Times</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className="lg:self-start lg:justify-self-end">
              <h3 className="font-semibold text-base sm:text-lg mb-4" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                Follow Us
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter (X)</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-4 sm:pt-6">
            <p className="text-gray-400 text-xs sm:text-sm flex items-center justify-center lg:justify-start" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
              <span className="mr-2">©</span>
              2025 PSA Card. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;