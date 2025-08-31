import { useState } from 'react';
import { HiOutlineClipboardList, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import BatchCard from './BatchCard';
import type { Batch } from '../types/batch.types';

interface ActiveBatchesProps {
  batches: Batch[] | undefined;
  isLoading: boolean;
  onCreateSubmission: (batchId: number) => void;
}

const ActiveBatches: React.FC<ActiveBatchesProps> = ({ batches, isLoading, onCreateSubmission }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 sm:px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <h5 className="text-base sm:text-lg font-medium text-gray-800">Active Batches</h5>
            {!isLoading && batches && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                {batches.length}
              </span>
            )}
          </div>
          <div className="flex items-center">
            {isExpanded ? (
              <HiChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <HiChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="p-6 sm:p-8 space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : batches && batches.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {batches.map((batch) => (
                  <BatchCard key={batch.id} batch={batch} onCreateSubmission={onCreateSubmission} />
                ))}
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <HiOutlineClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2 text-sm sm:text-base">No batches open</p>
                <p className="text-xs sm:text-sm text-gray-500">Submissions are currently unavailable. Please check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveBatches;