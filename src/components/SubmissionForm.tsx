// import Input from "./FieldInput"; // Not needed anymore
import type { ChangeEvent } from "react";
import { LuUpload } from "react-icons/lu";

type SubmissionData = {
  name: string;
  year: string;
  brand: string;
  serial_number: string;
  grade_target: string;
  images: File[];
};

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
  const updateField = (key: keyof SubmissionData, value: string | File[]) => {
    if (!disabled) {
      onChange(index, { ...data, [key]: value });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files) {
      const validImages = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      updateField("images", [...data.images, ...validImages]);
    }
  };

  const removeImage = (imageIndex: number) => {
    if (disabled) return;
    
    const updatedImages = data.images.filter((_, i) => i !== imageIndex);
    updateField("images", updatedImages);
  };

  return (
    <div className="border border-gray-200 bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Name</label>
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
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
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
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
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
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
          <input
            type="text"
            placeholder="Enter serial number"
            name="serial_number"
            required
            value={data.serial_number}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              updateField("serial_number", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade Target</label>
          <select
            name="grade_target"
            value={data.grade_target}
            disabled={disabled}
            onChange={(e) => updateField("grade_target", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <option value="">Select grade target</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Card Images</label>
        
        {data.images?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {data.images.map((item, i) => (
              <div
                key={i}
                className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
              >
                <img
                  src={URL.createObjectURL(item)}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-32 object-cover"
                />
                {!disabled && (
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors"
                    type="button"
                  >
                    ×
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <label
          htmlFor={`picture-${index}`}
          className={`
            flex items-center justify-center gap-2 w-full h-12 
            border-2 border-dashed border-gray-300 rounded-lg
            text-gray-600 cursor-pointer transition-all
            ${disabled 
              ? 'bg-gray-50 cursor-not-allowed opacity-50' 
              : 'hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
            }
          `}
        >
          <LuUpload className="w-5 h-5" />
          {data.images?.length > 0 ? 'Add More Images' : 'Upload Card Images'}
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
        
        {data.images?.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Please upload at least one image of your card
          </p>
        )}
      </div>
    </div>
  );
}