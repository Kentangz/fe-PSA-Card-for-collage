import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { queueEntryService } from "@/services/queueEntryService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Entry-based props only
  entryId: number;
  userInfo: { name: string; email: string };
  submissions: Array<{ id: string | number; name: string; year: string | number }>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entryId,
  userInfo,
  submissions,
}) => {
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const modalTitle = "Set & Send Payment";
  const submitText = "Set & Send";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentUrl.trim()) {
      setError("Payment URL is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await queueEntryService.setAndSendPayment(entryId, paymentUrl);

      onSuccess();
      onClose();
      setPaymentUrl("");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setError((error as { response: { data: { message: string } } }).response.data.message);
      } else {
        setError("Failed to save payment URL");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setPaymentUrl("");
    setError(null);
  };

  const displayUserName = userInfo?.name;
  const displayUserEmail = userInfo?.email;
  const displaySubmissions = submissions || [];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalTitle}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* User Info */}
          <div className="mb-4 p-3 bg-gray-50/80 rounded-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{displayUserName}</p>
                <p className="text-sm text-gray-600">{displayUserEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {displaySubmissions.length} submission{displaySubmissions.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Payment URL Input */}
          <div className="mb-4">
            <label htmlFor="paymentUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Payment URL
            </label>
            <input
              id="paymentUrl"
              value={paymentUrl}
              onChange={(e) => setPaymentUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300/70 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              placeholder="Paste payment link or code"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the payment link or code to send to the user
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50/80 border border-red-200/50 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submission List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Submissions included:</h4>
            <div className="max-h-32 overflow-y-auto bg-gray-50/80 rounded-lg p-2 border border-gray-200/50 backdrop-blur-sm">
              {displaySubmissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1 px-2 text-xs">
                  <span className="truncate mr-2" title={s.name}>
                    {s.name}
                  </span>
                  <span className="text-gray-500 flex-shrink-0">
                    {s.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300/70 rounded-lg hover:bg-gray-50/90 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600/90 backdrop-blur-sm rounded-lg hover:bg-blue-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                submitText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;