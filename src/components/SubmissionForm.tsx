import Input from "./FieldInput";
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
}: {
  index: number;
  data: SubmissionData;
  onChange: (index: number, data: SubmissionData) => void;
}) {
  const updateField = (key: keyof SubmissionData, value: string | File[]) => {
    onChange(index, { ...data, [key]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validImages = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      updateField("images", [...data.images, ...validImages]);
    }
  };

  const removeImage = (imageIndex: number) => {
    const updatedImages = data.images.filter((_, i) => i !== imageIndex);
    updateField("images", updatedImages);
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 p-4 rounded">
      <div className="grid grid-cols-2 gap-4 mb-4 w-full">
        <div>
          <label className="block text-sm font-medium mb-1">Card Name</label>
          <Input
            type="text"
            placeholder="Enter card name"
            name="name"
            required
            value={data.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              updateField("name", e.target.value)
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <input
            type="number"
            placeholder="Enter year"
            name="year"
            required
            value={data.year}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              updateField("year", e.target.value)
            }
            className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <Input
            type="text"
            placeholder="Enter brand"
            name="brand"
            required
            value={data.brand}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              updateField("brand", e.target.value)
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Serial Number</label>
          <Input
            type="text"
            placeholder="Enter serial number"
            name="serial_number"
            required
            value={data.serial_number}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              updateField("serial_number", e.target.value)
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Grade Target</label>
          <select
            name="grade_target"
            value={data.grade_target}
            onChange={(e) => updateField("grade_target", e.target.value)}
            className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Select grade target</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        {data.images?.map((item, i) => (
          <div
            key={i}
            className="w-full border border-neutral-700 rounded overflow-hidden mb-4 relative"
          >
            <img
              src={URL.createObjectURL(item)}
              alt="Preview"
              className="h-full w-full object-cover max-h-96"
            />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
        <label
          htmlFor={`picture-${index}`}
          className="px-2 border border-neutral-200 dark:border-neutral-700 flex items-center rounded w-full h-10 gap-2 justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <LuUpload />
          Upload Picture
        </label>
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          id={`picture-${index}`}
          className="hidden"
          multiple
          accept="image/*"
        />
      </div>
    </div>
  );
}