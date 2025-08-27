import { useState } from "react";
import { BsX } from "react-icons/bs";
import { batchService, type CreateBatchData } from "../services/batchService";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
}

export default function AddBatchModal({ isOpen, onClose, onSuccess }: AddBatchModalProps) {
  const [formData, setFormData] = useState<CreateBatchData>({
    services: '',
    category: 'PSA-Japan' as 'PSA-Japan' | 'PSA-USA' | 'CGC',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await batchService.createBatch(formData);
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        services: '',
        category: 'PSA-Japan',
        is_active: true
      });
    } catch (err) {
      console.error('Create batch error:', err);
      
      const errorObj = err as ErrorResponse;
      
      // Handle different error types
      if (errorObj.response?.data?.message) {
        setError(errorObj.response.data.message);
      } else if (errorObj.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = Object.values(errorObj.response.data.errors).flat();
        setError(validationErrors.join(', '));
      } else {
        setError(errorObj.message || 'Failed to create batch');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Batch</h2>
          <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
          >
        <BsX className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
          )}

          {/* Services Field */}
          <div>
        <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-2">
          Services (Description)
        </label>
        <textarea
          id="services"
          rows={3}
          value={formData.services}
          onChange={(e) => setFormData({ ...formData, services: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Describe the services for this batch..."
          required
        />
          </div>

          {/* Category Field */}
          <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as 'PSA-Japan' | 'PSA-USA' | 'CGC' })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          required
        >
          <option value="PSA-Japan">PSA-Japan</option>
          <option value="PSA-USA">PSA-USA</option>
          <option value="CGC">CGC</option>
        </select>
          </div>

          {/* Is Active Field */}
          <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Active (users can submit to this batch)</span>
        </label>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Batch'}
        </button>
          </div>
        </form>
      </div>
    </div>
  );
}