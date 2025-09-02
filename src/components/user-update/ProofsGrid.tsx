import React from "react";
import { getImageUrl } from "@/utils/imageUtils";

type Proof = {
  id: number;
  image_path: string;
};

type Props = {
  proofs: Proof[];
  deletingId: number | null;
  onDelete: (proofId: number) => void;
  onPreview: (url: string) => void;
};

const ProofsGrid: React.FC<Props> = ({ proofs, deletingId, onDelete, onPreview }) => {
  if (proofs.length === 0) return null;
  return (
    <div>
      <h5 className="text-sm font-medium text-gray-700 mb-3">Uploaded Proofs ({proofs.length})</h5>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {proofs.map((proof) => (
          <div key={proof.id} className="relative group">
            <img
              src={getImageUrl(proof.image_path)}
              alt={`Delivery proof ${proof.id}`}
              className="w-full h-20 sm:h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onPreview(getImageUrl(proof.image_path))}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(proof.id); }}
              disabled={deletingId === proof.id}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete image"
            >
              {deletingId === proof.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              ) : (
                "×"
              )}
            </button>
            <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">✓</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProofsGrid;


