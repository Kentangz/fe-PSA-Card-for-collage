import { useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { Batch } from '../types/batch.types';
import { getBatchCategoryStyling } from '../utils/statusUtils';

interface BatchInfoProps {
  batch: Batch;
  onBackToDashboard: () => void;
  isSubmitting: boolean;
}

const BatchInfo: React.FC<BatchInfoProps> = ({ batch, onBackToDashboard, isSubmitting }) => {
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const maxLength = 200;
  
  const shouldTruncateServices = batch.services.length > maxLength;
  const displayServices = shouldTruncateServices && !isServicesExpanded 
    ? batch.services.slice(0, maxLength) + '...' 
    : batch.services;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {batch.batch_number}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${getBatchCategoryStyling(batch.category)}`}>
                  {batch.category}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Register Number:</span> {batch.register_number}</p>
                <div>
                  <p className="mb-1"><span className="font-medium">Services:</span></p>
                  <div className="text-sm leading-relaxed">
                    <p>{displayServices}</p>
                    {shouldTruncateServices && (
                      <button
                        onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                        className="mt-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        {isServicesExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onBackToDashboard}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-shrink-0"
            >
              <MdArrowBack className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchInfo;