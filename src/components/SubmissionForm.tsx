import type { ChangeEvent } from "react";
import { useState } from "react";
import { LuUpload, LuCamera } from "react-icons/lu";
import CameraCapture from "@/components/CameraCapture";
import type { SubmissionFormData } from "@/hooks/useSubmissions";
import { validateFiles } from "@/utils/fileValidation";

type SubmissionData = SubmissionFormData;

export default function SubmissionForm({
  index,
  data,
  onChange,
  disabled = false,
}: {
  index: number;
  data: SubmissionData;
  onChange: (index: number, data: SubmissionData) => void;
  disabled?: boolean;
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const updateField = (key: keyof SubmissionData, value: string | File[]) => {
    if (!disabled) {
      onChange(index, { ...data, [key]: value });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (!files) return;
    const { valid, errors } = validateFiles(Array.from(files));
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
    if (valid.length > 0) {
      updateField("images", [...data.images, ...valid]);
    }
  };

  const handleCameraCapture = (capturedImages: File[]) => {
    if (disabled) return;
    updateField("images", [...data.images, ...capturedImages]);
  };

  const removeImage = (imageIndex: number) => {
    if (disabled) return;
    
    const updatedImages = data.images.filter((_, i) => i !== imageIndex);
    updateField("images", updatedImages);
  };

  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  return (
    <div className="border border-gray-200 bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Mobile */}
      <div className="sm:hidden mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-800">
          Submission {index + 1}
        </h3>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4 space-y-3 sm:space-y-0">
          {/* Card Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Card Name
            </label>
            <input
              type="text"
              placeholder="Enter card name"
              name="name"
              required
              value={data.name}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                updateField("name", e.target.value)
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed text-sm sm:text-base"
            />
          </div>
          
          {/* Year */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Year
            </label>
            <input
              type="number"
              placeholder="Enter year"
              name="year"
              required
              value={data.year}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                updateField("year", e.target.value)
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed text-sm sm:text-base"
            />
          </div>
        </div>
        
        <div className="sm:col-span-2">
          {/* Brand - Now full width */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Brand
            </label>
            <input
              type="text"
              placeholder="Enter brand"
              name="brand"
              required
              value={data.brand}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                updateField("brand", e.target.value)
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed text-sm sm:text-base"
            />
          </div>
        </div>
        
        {/* Grade Target */}
        {/* <div className="sm:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Grade Target
          </label>
          <select
            name="grade_target"
            value={data.grade_target}
            disabled={disabled}
            onChange={(e) => updateField("grade_target", e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <option value="">Select grade target</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div> */}
      </div>

      {/* Images Section */}
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Card Images
          {data.images?.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({data.images.length} image{data.images.length !== 1 ? 's' : ''})
            </span>
          )}
        </label>
        
        {/* Image Preview Grid - Responsive */}
        {data.images?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
            {data.images.map((item, i) => (
              <div
                key={i}
                className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-square"
              >
                <img
                  src={URL.createObjectURL(item)}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {!disabled && (
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold transition-colors"
                    type="button"
                  >
                    ×
                  </button>
                )}
                {/* Image name - only on larger screens */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 sm:p-2 hidden sm:block">
                  <div className="truncate">
                    {item.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Options - Camera and File Upload */}
        <div className="space-y-3 sm:space-y-4">
          
          {/* Camera Button - Only show if supported */}
          {isCameraSupported() && (
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              disabled={disabled}
              className={`
                flex items-center justify-center gap-2 w-full h-10 sm:h-12 
                border-2 border-dashed border-blue-300 rounded-lg
                text-blue-600 bg-blue-50 cursor-pointer transition-all text-sm sm:text-base
                ${disabled 
                  ? 'bg-gray-50 border-gray-300 text-gray-400 cursor-not-allowed opacity-50' 
                  : 'hover:border-blue-400 hover:bg-blue-100'
                }
              `}
            >
              <LuCamera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Take Photos with Camera</span>
              <span className="sm:hidden">Take Photos</span>
            </button>
          )}

          {/* File Upload Button */}
          <label
            htmlFor={`picture-${index}`}
            className={`
              flex items-center justify-center gap-2 w-full h-10 sm:h-12 
              border-2 border-dashed border-gray-300 rounded-lg
              text-gray-600 cursor-pointer transition-all text-sm sm:text-base
              ${disabled 
                ? 'bg-gray-50 cursor-not-allowed opacity-50' 
                : 'hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
              }
            `}
          >
            <LuUpload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">
              {data.images?.length > 0 ? 'Add More Images' : 'Upload Card Images'}
            </span>
            <span className="sm:hidden">
              {data.images?.length > 0 ? 'Add Images' : 'Upload Images'}
            </span>
          </label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            id={`picture-${index}`}
            className="hidden"
            multiple
            accept="image/*"
            disabled={disabled}
          />
        </div>
        
        {/* Upload Instructions */}
        {data.images?.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            <span className="hidden sm:inline">
              Take photos with camera or upload images from your device
            </span>
            <span className="sm:hidden">
              Take photos or upload images
            </span>
          </p>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        disabled={disabled}
      />
    </div>
  );
}