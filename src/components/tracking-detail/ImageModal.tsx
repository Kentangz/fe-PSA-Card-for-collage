import React from "react";

type Props = {
  url: string | null;
  onClose: () => void;
};

const ImageModal: React.FC<Props> = ({ url, onClose }) => {
  if (!url) return null;
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="max-w-4xl max-h-full">
        <img 
          src={url} 
          alt="Card full size"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;


