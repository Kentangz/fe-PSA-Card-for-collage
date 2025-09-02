import { useState, useEffect } from "react";
import { BsSearch, BsX, BsFilter, BsChevronDown, BsChevronUp } from "react-icons/bs";
import type { FilterOptions } from "@/types/submission";

interface SubmissionFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalResults?: number;
  isLoading?: boolean;
  showAddBatch?: boolean;
  onAddBatch?: () => void;
}

const sortOptions = [
  { value: 'created_at', label: 'Date Submitted' },
  { value: 'name', label: 'Customer Name' },
  { value: 'serial_number', label: 'Serial Number' },
  { value: 'status', label: 'Status' },
];

export default function SubmissionFilter({ 
  onFilterChange, 
  totalResults = 0, 
  showAddBatch = false,
  onAddBatch
}: SubmissionFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({
        searchTerm,
        sortBy,
        sortOrder
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortBy, sortOrder, onFilterChange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || sortBy !== 'created_at' || sortOrder !== 'desc';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Main Filter Bar */}
      <div className="p-2">
        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-3">
          {/* Search Input with Add Batch - Mobile */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BsSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <BsX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {/* Add Batch Button - Mobile (beside search) */}
            {showAddBatch && (
              <button
                onClick={onAddBatch}
                className="inline-flex items-center px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">Add Batch</span>
                <span className="sm:hidden">+</span>
              </button>
            )}
          </div>

          {/* Mobile Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Results Count - Mobile */}
            <div className="flex-1">
              <span className="text-xs sm:text-sm text-gray-500">
                {totalResults} result{totalResults !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Filter Button - Mobile */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <BsFilter className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Filters</span>
                {showAdvancedFilters ? (
                  <BsChevronUp className="h-3 w-3 ml-1.5" />
                ) : (
                  <BsChevronDown className="h-3 w-3 ml-1.5" />
                )}
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <span className="hidden sm:inline">Active</span>
                    <span className="sm:hidden">•</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
          {/* Search Input with Add Batch - Desktop */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BsSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <BsX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {/* Add Batch Button - Desktop (beside search) */}
            {showAddBatch && (
              <button
                onClick={onAddBatch}
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-shrink-0"
              >
                + Add Batch
              </button>
            )}
          </div>

          {/* Desktop Controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Results Count - Desktop */}
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </span>
            
            {/* Filter Toggle - Desktop */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <BsFilter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Active
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-3 sm:p-4">
            {/* Mobile Filter Layout */}
            <div className="block lg:hidden space-y-4">
              {/* Sort Controls - Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sort-by-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    id="sort-by-mobile"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sort-order-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <select
                    id="sort-order-mobile"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Filter Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
              {/* Sort By - Desktop */}
              <div>
                <label htmlFor="sort-by-desktop" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort-by-desktop"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order - Desktop */}
              <div>
                <label htmlFor="sort-order-desktop" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  id="sort-order-desktop"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <BsX className="h-4 w-4 mr-1.5" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}