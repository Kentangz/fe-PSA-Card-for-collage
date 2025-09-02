import React from "react";

type Props = {
  uploading: boolean;
  count: number;
  onUpload: () => void;
  onCancelAll: () => void;
};

const ActionButtons: React.FC<Props> = ({ uploading, count, onUpload, onCancelAll }) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
      <button
        onClick={onUpload}
        disabled={uploading}
        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Uploading {count} image(s)...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload {count} image(s)
          </>
        )}
      </button>
      <button
        onClick={onCancelAll}
        disabled={uploading}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Cancel All
      </button>
    </div>
  );
};

export default ActionButtons;


