import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import Navbar from '../../components/landing-page/Navbar';
import Footer from '../../components/landing-page/Footer';

import type { CardImage, CardStatus } from "@/types/card.types";

interface DisplayImage {
  type: 'certificate' | 'upload';
  url: string;
}

interface Certificate {
  id: number;
  card_id: string;
  cert_url: string;
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
  display_images: DisplayImage[];
  certificates: Certificate[];
  latest_status: CardStatus;
  statuses: CardStatus[];
}

interface ResolvedImage {
  url: string;
  type: 'certificate' | 'upload' | 'placeholder';
  index: number;
}

const ProductDetail: React.FC = () => {
  const { serialNumber } = useParams<{ serialNumber: string }>();
  const [card, setCard] = useState<CardDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedImages, setResolvedImages] = useState<ResolvedImage[]>([]);
  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (serialNumber) {
      fetchCardDetail(serialNumber);
    }
  }, [serialNumber]);

  // Smart Fallback Image Loading
  useEffect(() => {
    if (!card || !card.display_images) return;

    const loadImages = async () => {
      const displayImages = card.display_images;
      const fallbackImages = card.images || [];
      
      // Initialize loading states
      setImageLoadingStates(new Array(displayImages.length).fill(true));
      
      // Load images in parallel with smart fallback
      const imagePromises = displayImages.map(async (displayImg, index): Promise<ResolvedImage | null> => {
        try {
          // Try primary image (from display_images)
          const isValidImage = await checkImageUrl(displayImg.url);
          if (isValidImage) {
            return {
              url: displayImg.url,
              type: displayImg.type, // This now matches ResolvedImage type
              index
            } as ResolvedImage;
          }
        } catch (error) {
        }

        // Fallback to images array if available
        if (fallbackImages[index]) {
          try {
            const fallbackUrl = fallbackImages[index].path;
            const isValidFallback = await checkImageUrl(fallbackUrl);
            if (isValidFallback) {
              return {
                url: fallbackUrl,
                type: 'upload' as const,
                index
              } as ResolvedImage;
            }
          } catch (error) {
          }
        }

        // Both failed, return null (will be filtered out)
        return null;
      });

      // Wait for all promises and filter out nulls
      const results = await Promise.all(imagePromises);
      const validImages = results.filter((img): img is ResolvedImage => img !== null);
      
      setResolvedImages(validImages);
      setImageLoadingStates(new Array(displayImages.length).fill(false));
    };

    loadImages();
  }, [card]);

  // Helper function to check if image URL is valid
  const checkImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  };

  const fetchCardDetail = async (serial: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Search by serial number
      const response = await axiosInstance.get<CardDetail>(`/public-card-search-serial?q=${encodeURIComponent(serial)}`);
      setCard(response.data);
    } catch (err: unknown) {
      console.error('Error fetching card detail by serial number:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          setError('Card with this serial number not found. Please check and try again.');
        } else {
          setError('Failed to load card details. Please try again later.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
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

  // Image Gallery Component with Smart Loading
  const ImageGallery = () => {
    const isImagesLoading = imageLoadingStates.some(state => state);
    const hasImages = resolvedImages.length > 0;

    // Show skeleton while loading
    if (isImagesLoading && card?.display_images) {
      return (
        <div className="mb-8">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 max-w-xs sm:max-w-4xl mx-auto justify-center">
            {card.display_images.map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="bg-gray-300 rounded-xl aspect-[3/4] w-32 sm:w-48 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Show resolved images
    if (hasImages) {
      return (
        <div className="mb-8">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 max-w-xs sm:max-w-4xl mx-auto justify-center">
            {resolvedImages.map((image, displayIndex) => (
              <div key={`${image.index}-${displayIndex}`} className="flex-shrink-0">
                <div className="rounded-xl overflow-hidden aspect-[3/4] w-32 sm:w-48 shadow-lg">
                  <img
                    src={image.url}
                    alt={`Card image ${displayIndex + 1}`}
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
        </div>
      );
    }

    // Show empty state
    return (
      <div className="mb-8">
        <div className="bg-gray-100 rounded-xl aspect-[3/4] w-32 sm:w-48 mx-auto flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 sm:w-12 h-8 sm:h-12 bg-gray-300 rounded-lg mx-auto mb-2"></div>
            <p className="text-xs sm:text-sm">No images available</p>
          </div>
        </div>
      </div>
    );
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
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 max-w-xs sm:max-w-4xl mx-auto justify-center">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="bg-gray-300 rounded-xl aspect-[3/4] w-32 sm:w-48"></div>
              </div>
            ))}
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

  // Error Component
  const ErrorComponent = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-16">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Card Not Found</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {error || 'The card you are looking for could not be found. Please check the ID or serial number and try again.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#462895] text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-900 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      
      {isLoading ? (
        <SkeletonLoader />
      ) : error ? (
        <ErrorComponent />
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
              
              <a 
                href={`https://www.psacard.com/cert/${card.serial_number.toLowerCase()}/${card.brand.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-2 border-purple-[#462895] rounded-lg px-2 py-1 mb-6 hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <span className="text-lg sm:text-2xl font-semibold text-[#462895]" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                  {formatCertNumber(card.serial_number)}
                </span>
              </a>

              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-0 px-2" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                {card.name.toUpperCase()}
              </h1>
              
            </div>

            <div className="">
              {/* Smart Image Gallery */}
              <ImageGallery />

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
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Card ID</dt>
                      </div>
                      <dd className="text-base sm:text-lg font-semibold text-gray-900 ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{(card.id)}</dd>
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
                        <dt className="text-xs sm:text-sm font-sembold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>Serial Number</dt>
                      </div>
                      <dd className="text-base sm:text-lg text-gray-900 font-semibold ml-7 sm:ml-0" style={{ fontFamily: 'Inter Tight, sans-serif' }}>{card.serial_number || 'N/A'}</dd>
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