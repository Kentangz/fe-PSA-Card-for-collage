import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import Navbar from '../../components/landing-page/Navbar';
import Footer from '../../components/landing-page/Footer';

interface CardImage {
  id: number;
  card_id: string;
  path: string;
  created_at: string;
  updated_at: string;
}

interface CardStatus {
  id: number;
  card_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CardDetail {
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
  latest_status: CardStatus;
  statuses: CardStatus[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<CardDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (id) {
      fetchCardDetail(id);
    }
  }, [id]);

  const fetchCardDetail = async (cardId: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<CardDetail>(`/public-card-search?q=${cardId}`);
      setCard(response.data);
    } catch (err: unknown) {
      console.error('Error fetching card detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCertNumber = (certId: string) => {
    return `#${certId.replace(/-/g, '').toUpperCase().slice(-12)}`;
  };

  const getGradeColor = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum >= 9) return 'bg-green-100 text-green-800 border-green-200';
    if (gradeNum >= 7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (gradeNum >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Certificate Header Skeleton */}
      <div className="text-center py-8 px-4 sm:px-6 mt-10">
        <div className="h-4 bg-gray-300 rounded w-full max-w-80 mx-auto mb-6"></div>
        <div className="inline-block border-2 border-gray-300 rounded-lg px-4 sm:px-8 py-4 mb-6">
          <div className="h-6 sm:h-8 bg-gray-300 rounded w-32 sm:w-48"></div>
        </div>
        <div className="h-6 sm:h-8 bg-gray-300 rounded w-full max-w-96 mx-auto mb-4"></div>
      </div>

      <div className="">
        {/* Card Images Skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-xs sm:max-w-2xl mx-auto">
            <div className="bg-gray-300 rounded-xl aspect-[3/4]"></div>
            <div className="bg-gray-300 rounded-xl aspect-[3/4]"></div>
          </div>
        </div>

        {/* Card Information Skeleton */}
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          {/* Grading Information Skeleton */}
          <div className="bg-white grid grid-cols-2 gap-4 sm:gap-6 text-center p-4 rounded-lg">
            <div>
              <div className="h-4 bg-gray-300 rounded w-16 sm:w-20 mx-auto mb-2"></div>
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-8 sm:w-12 mx-auto"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-20 sm:w-24 mx-auto mb-2"></div>
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-6 sm:w-8 mx-auto"></div>
            </div>
          </div>

          {/* Population Data Skeleton */}
          <div className="bg-white grid grid-cols-2 gap-4 sm:gap-6 text-center p-4 rounded-lg">
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 sm:w-28 mx-auto mb-2"></div>
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-4 sm:w-6 mx-auto"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-20 sm:w-24 mx-auto mb-2"></div>
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-4 sm:w-6 mx-auto"></div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-300 h-12 sm:h-14 rounded-2xl"></div>
            <div className="bg-gray-300 h-12 sm:h-14 rounded-2xl"></div>
          </div>

          {/* Item Information Section Skeleton */}
          <div className="pt-6 sm:pt-8">
            <div className="h-6 sm:h-8 bg-gray-300 rounded w-40 sm:w-48 mb-4 sm:mb-6"></div>
            
            <div className="space-y-4">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 sm:w-5 h-4 sm:h-5 bg-gray-300 rounded flex-shrink-0"></div>
                    <div className="h-4 bg-gray-300 rounded w-20 sm:w-24"></div>
                  </div>
                  <div className="ml-7 sm:ml-0">
                    <div className="h-5 sm:h-6 bg-gray-300 rounded w-24 sm:w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        card && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Content */}
            {/* Certificate Header */}
            <div className="text-center py-8 px-4 sm:px-6 mt-10">
              <p className="text-xs sm:text-sm mb-6">
                According to the PSA database, the requested certification<br className="hidden sm:block" />
                <span className="sm:hidden"> </span>number is defined as the following:
              </p>
              
              <div className="inline-block border-2 border-purple-[#462895] rounded-lg px-2 py-1 mb-6">
                <span className="text-lg sm:text-2xl font-semibold text-[#462895]" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                  {formatCertNumber(card.id)}
                </span>
              </div>

              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-0 px-2" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                {card.year} {card.brand.toUpperCase()} {card.name.toUpperCase()}
              </h1>
              
            </div>

            <div className="">
              {/* Card Images */}
              <div className="mb-8">
                {card.images && card.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-xs sm:max-w-2xl mx-auto">
                    {card.images.slice(0, 2).map((image, index) => (
                      <div key={image.id} className="relative">
                        <div className="rounded-xl overflow-hidden aspect-[3/4] shadow-lg">
                          <img
                            src={image.path}
                            alt={`Card image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTMzLjVMMTIwIDExMy41SDE4MFYxNTMuNUgxMjBMMTAwIDEzMy41WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl aspect-[3/4] flex items-center justify-center max-w-xs sm:max-w-md mx-auto">
                    <div className="text-center text-gray-500">
                      <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gray-300 rounded-lg mx-auto mb-3"></div>
                      <p className="text-xs sm:text-sm">No image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Information - Below Images */}
              <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                {/* Grading Information */}
                <div className="bg-white grid grid-cols-2 gap-4 sm:gap-6 text-center p-3 sm:p-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Item Grade</h3>
                    <div className={`bg-white py-1 font-bold text-base sm:text-lg ${getGradeColor(card.grade)}`}>
                      {card.grade}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">PSA Estimate</h3>
                    <div className="text-lg sm:text-2xl font-bold">-</div>
                  </div>
                </div>

                {/* Population Data */}
                <div className="bg-white grid grid-cols-2 gap-4 sm:gap-6 text-center p-3 sm:p-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">PSA Population</h3>
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">1</div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">PSA Pop Higher</h3>
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">0</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-[#462895] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-medium hover:bg-purple-900 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                    Sales History
                  </button>
                  <button className="bg-white px-4 sm:px-6 py-3 rounded-2xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                    Shop
                  </button>
                </div>
                
                {/* Item Information Section - Below Buttons */}
                <div className="pt-6 sm:pt-8" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Item Information</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Cert Number</dt>
                      </div>
                      <dd className="text-base sm:text-lg font-semibold text-gray-900 ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{formatCertNumber(card.id)}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Item Grade</dt>
                      </div>
                      <dd className="text-base sm:text-lg font-semibold text-gray-900 ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{card.grade}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Label Type</dt>
                      </div>
                      <div className="text-left ml-7 sm:ml-0">
                        <dd className="text-base sm:text-lg text-gray-900 font-semibold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>PSA</dd>
                        <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter Tight, sans-serif' }}>w/ Fugitive Ink Technology</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Reverse Cert/Barcode</dt>
                      </div>
                      <dd className="text-base sm:text-lg text-gray-900 font-semibold ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Yes</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Year</dt>
                      </div>
                      <dd className="text-base sm:text-lg text-gray-900 font-semibold ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{card.year}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Brand/Title</dt>
                      </div>
                      <dd className="text-base sm:text-lg text-gray-900 font-semibold ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{card.brand.toUpperCase()}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Subject</dt>
                      </div>
                      <dd className="text-base sm:text-lg text-gray-900 font-semibold ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{card.name.toUpperCase()}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Card Number</dt>
                      </div>
                      <dd className="text-base sm:text-lg text-gray-900 font-semibold ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{card.serial_number}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[400px_1fr] items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-3">
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Category</dt>
                      </div>
                      <dd className="text-base sm:text-lg text-gray-900 font-semibold ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>TRADING CARDS</dd>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )
      )}
      <Footer/>
    </div>
  );
};

export default ProductDetail;