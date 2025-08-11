import React, { useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';

const Product: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  const products = [
    {
      id: 1,
      title: "The Fallen - Matte Art...",
      image: "/api/placeholder/300/400", // Replace with actual image path
      category: "Dragon Shield"
    },
    {
      id: 2,
      title: "Ruby - Matte Dual Sle...",
      image: "/api/placeholder/300/400", // Replace with actual image path
      category: "Dragon Shield"
    },
    {
      id: 3,
      title: "Rick & Morty - Cool Ri...",
      image: "/api/placeholder/300/400", // Replace with actual image path
      category: "Rick & Morty"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            <span className="text-blue-600 font-medium text-sm uppercase tracking-wide">
              Explore PSA's Services
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-6" style={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            lineHeight: '72px',
            letterSpacing: '0%'
          }}>
            For Collectors, Sellers, and<br />
            Enthusiasts Alike
          </h2>
          
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Whether you're protecting a rare rookie card or preparing a full set for<br />
            auction, PSA provides the tools and confidence you need.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter a Cert Number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative bg-gray-200 rounded-2xl overflow-hidden aspect-[3/4] mb-4">
                {/* Product Image Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-400 rounded-lg"></div>
                    <p className="text-sm">Product Image</p>
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg group-hover:text-white transition-colors">
                      {product.title}
                    </h3>
                    
                    {/* Arrow Icon */}
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product;