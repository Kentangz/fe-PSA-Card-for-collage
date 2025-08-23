import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import { BE_URL } from '../../lib/api';

interface CardImage {
  id: string;
  path: string;
}

interface LatestCard {
  id: string;
  serial_number: string;
  path: string;
}

interface SearchResult {
  id: string;
  user_id: number;
  name: string;
  year: number;
  brand: string;
  serial_number: string;
  grade_target: string;
  grade: string;
  created_at: string;
  updated_at: string;
  images: CardImage[];
  latest_status: {
    id: number;
    card_id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

const Product: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [latestCards, setLatestCards] = useState<LatestCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();

  const STORAGE_BASE_URL = `${BE_URL}/storage`;

  useEffect(() => {
    fetchLatestCards();
  }, []);

  const fetchLatestCards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get<LatestCard[]>('/public-latest-cards');
      setLatestCards(response.data);
    } catch (err: unknown) {
      console.error('Error fetching latest cards:', err);
      setError('Failed to load latest cards. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setSearchError('Please enter a valid serial number');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Updated API endpoint for serial number search
      const response = await axiosInstance.get<SearchResult>(`/public-card-search-serial?q=${encodeURIComponent(searchValue.trim())}`);

      // Navigate using serial number instead of ID
      navigate(`/product/${encodeURIComponent(response.data.serial_number)}`);
      
    } catch (err: unknown) {
      console.error('Search error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status: number } };
        if (axiosError.response?.status === 429) {
          setSearchError('Search limit exceeded. Please try again in a minute.');
        } else if (axiosError.response?.status === 404) {
          setSearchError('Serial number not found. Please check and try again.');
        } else {
          setSearchError('Search failed. Please try again.');
        }
      } else {
        setSearchError('Search failed. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCardClick = (card: LatestCard) => {
    // Navigate using serial number if available, otherwise use ID
    const identifier = card.serial_number || card.id;
    navigate(`/product/${encodeURIComponent(identifier)}`);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 xl:py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="w-2 h-2 bg-purple-800 rounded-full mr-3"></div>
            <span className="text-purple-800 font-medium text-xs sm:text-sm uppercase tracking-wide">
              Explore PSA's Services
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4 sm:mb-6 px-2" style={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            lineHeight: '1.2',
            letterSpacing: '0%'
          }}>
            For Collectors, Sellers, and<br className="hidden sm:block" />
            Enthusiasts Alike
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4 sm:px-0">
            Whether you're protecting a rare rookie card or preparing a full set for<br className="hidden lg:block" />
            auction, PSA provides the tools and confidence you need.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto relative px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter a Serial Number"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setSearchError(null);
                  }}
                  disabled={isSearching}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-full sm:rounded-r-none text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                />
              </div>
              
              {/* Search Button */}
              <button
                type="submit"
                disabled={isSearching || !searchValue.trim()}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-full sm:rounded-l-none font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none min-w-[120px] sm:min-w-[140px] relative overflow-hidden group text-sm sm:text-base"
              >
                {/* Button Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center gap-2">
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="hidden xs:inline sm:inline">Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline sm:inline">Search</span>
                    </>
                  )}
                </div>
              </button>
            </div>
            
            {/* Search Error */}
            {searchError && (
              <div className="mt-3 flex items-center justify-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-center">{searchError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Latest Cards Grid */}
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 rounded-2xl aspect-[3/4] mb-4"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4 text-sm sm:text-base px-4">{error}</p>
              <button
                onClick={fetchLatestCards}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          )}

          {/* Cards Grid - Responsive Layout */}
          {!isLoading && !error && latestCards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
              {latestCards.map((card, index) => (
                <div 
                  key={card.id} 
                  className="group cursor-pointer transform transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2"
                  onClick={() => handleCardClick(card)}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="relative bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden aspect-[3/4] mb-2 sm:mb-4 shadow-md sm:shadow-lg group-hover:shadow-xl sm:group-hover:shadow-2xl transition-all duration-500">
                    {/* Card Image */}
                    <img
                      src={`${STORAGE_BASE_URL}/${card.path}`}
                      alt="Trading Card"
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 sm:group-hover:scale-110"
                      onError={(e) => {
                        // Fallback jika gambar gagal dimuat
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center transition-all duration-500 group-hover:scale-105 sm:group-hover:scale-110">
                              <div class="text-gray-500 text-center">
                                <div class="w-8 h-8 sm:w-12 md:w-16 mx-auto mb-2 sm:mb-3 bg-gray-400 rounded-lg"></div>
                                <p class="text-xs sm:text-sm">Image Not Available</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Card Info Overlay - Responsive */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 lg:p-6 transform translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300">
                            {card.serial_number ? `Serial: ${card.serial_number}` : `Card #${card.id.slice(-8).toUpperCase()}`}
                          </h3>
                          <p className="text-white/80 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            Latest Graded Card
                          </p>
                        </div>
                        
                        {/* Arrow Icon - Always Visible on Mobile */}
                        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 transform translate-y-0 sm:translate-y-2 lg:sm:translate-y-4 sm:group-hover:translate-y-0 delay-150">
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-pulse group-hover:left-full transition-all duration-1000"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Cards State */}
          {!isLoading && !error && latestCards.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-lg mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base px-4">No cards available at the moment.</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-xs sm:text-sm text-gray-500 px-4 sm:px-0">
            Search by serial number to view detailed card information and grading status.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Product;