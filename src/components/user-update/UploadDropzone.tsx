import React from "react";

type Props = {
  uploading: boolean;
  onClick: () => void;
};

const UploadDropzone: React.FC<Props> = ({ uploading, onClick }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
      <button
        type="button"
        onClick={onClick}
        disabled={uploading}
        className={`w-full cursor-pointer flex flex-col items-center justify-center ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} rounded-lg p-4 transition-colors border-none bg-transparent`}
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm text-gray-600">Click to select images (Multiple supported)</p>
            <p className="text-xs text-gray-500 mt-1">Max 2MB per image • JPEG, PNG, JPG, GIF</p>
          </>
        )}
      </button>
    </div>
  );
};

export default UploadDropzone;


