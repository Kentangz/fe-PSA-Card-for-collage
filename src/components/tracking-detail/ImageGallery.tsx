import React from "react";
import { BsImage } from "react-icons/bs";
import type { CardImage } from "@/types/card.types";
import { getImageUrl } from "@/utils/imageUtils";

type Props = {
  images: CardImage[];
  onSelect: (url: string) => void;
  compact?: boolean;
};

const ImageGallery: React.FC<Props> = ({ images, onSelect, compact = false }) => {
  const gridClass = compact ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "grid grid-cols-1 gap-3";
  const emptyClass = compact ? "text-center py-12 text-gray-500" : "text-center py-8 text-gray-400";
  const iconClass = compact ? "mx-auto h-12 w-12 text-gray-300 mb-4" : "mx-auto h-8 w-8 text-gray-300 mb-2";
  const emptyText = compact ? "No images available for this card" : "No images available";

  if (!images || images.length === 0) {
    return (
      <div className={emptyClass}>
        <BsImage className={iconClass} />
        <p className={compact ? "" : "text-xs"}>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {images.map((image, index) => (
        <div key={image.id} className="aspect-w-16 aspect-h-9 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          <img
            src={getImageUrl(image.path)}
            alt={`Card image ${index + 1}`}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => onSelect(getImageUrl(image.path))}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;


