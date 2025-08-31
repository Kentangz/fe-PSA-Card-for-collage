import { useState } from "react";
import type { BatchType } from "../types/submission";

const getCategoryStyling = (category: string) => {
  switch (category) {
    case 'PSA-Japan':
      return 'bg-slate-100 text-slate-700';
    case 'PSA-USA':
      return 'bg-gray-100 text-gray-700';
    case 'CGC':
      return 'bg-zinc-100 text-zinc-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface BatchCardProps {
  batch: BatchType;
  onCreateSubmission: (id: number) => void;
}

const BatchCard = ({ batch, onCreateSubmission }: BatchCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  
  const shouldTruncate = batch.services.length > maxLength;
  const displayServices = shouldTruncate && !isExpanded 
    ? batch.services.slice(0, maxLength) + '...' 
    : batch.services;

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h6 className="font-semibold text-gray-900 text-sm sm:text-base">
              {batch.batch_number}
            </h6>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${getCategoryStyling(batch.category)}`}>
              {batch.category}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Register:</span> {batch.register_number}</p>
            <div>
              <p className="mb-1"><span className="font-medium">Services:</span></p>
              <div className="text-sm leading-relaxed">
                <p>{displayServices}</p>
                {shouldTruncate && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onCreateSubmission(batch.id)}
          className="w-full sm:w-auto sm:flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation"
        >
          <span className="hidden sm:inline">Create Submission</span>
          <span className="sm:hidden">Create Submission</span>
        </button>
      </div>
    </div>
  );
};

export default BatchCard;