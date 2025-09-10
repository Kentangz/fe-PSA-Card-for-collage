
type PreviewItem = { file: File; preview: string; id: string };

type Props = {
  previews: PreviewItem[];
  uploading: boolean;
  uploadProgress: Record<string, number>;
  onRemove: (id: string) => void;
};

const PreviewGrid: React.FC<Props> = ({ previews, uploading, uploadProgress, onRemove }) => {
  if (previews.length === 0) return null;
  return (
    <div className="mt-3 space-y-3 border-2 border-green-500 p-4 rounded-lg bg-green-50">
      <div className="flex justify-between items-center">
        <h5 className="text-sm font-medium text-green-900">Selected Images ({previews.length})</h5>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {previews.map((imageData) => (
          <div key={imageData.id} className="relative group">
            <img src={imageData.preview} alt={`Preview ${imageData.file.name}`} className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-300 shadow-sm" />
            {uploading && uploadProgress[imageData.id] !== undefined && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-xs">{uploadProgress[imageData.id]}%</div>
              </div>
            )}
            <button
              onClick={() => onRemove(imageData.id)}
              disabled={uploading}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove image"
            >
              ×
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
              {imageData.file.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewGrid;


