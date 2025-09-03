import { useState } from "react";
import { Link } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import formatDate from "@/utils/formatDate";
import { getPaymentButtonState, formatSentAt } from "@/utils/batchPaymentUtils";
import StatusBadge from "@/components/StatusBadge";
import { PATHS } from "@/routes/paths";
import type { UserPaymentGroup as UserPaymentGroupType, CardType } from "@/types/submission";

const fields = [
  { label: "Name", name: "name", shortLabel: "Name" },
  { label: "Year", name: "year", shortLabel: "Year" },
  { label: "Brand", name: "brand", shortLabel: "Brand" },
  { label: "Serial Number", name: "serial_number", shortLabel: "Serial" },
  // { label: "Grade Target", name: "grade_target", shortLabel: "Grade" },
  { label: "Grade", name: "grade", shortLabel: "Grade" },
  { label: "Status", name: "status", shortLabel: "Status" },
  { label: "Submitted at", name: "submitted_at", shortLabel: "Date" },
];

const colVisibility: Record<string, string> = {
  name: "table-cell",
  year: "hidden lg:table-cell",
  brand: "hidden lg:table-cell",
  serial_number: "hidden xl:table-cell",
  grade: "hidden lg:table-cell",
  status: "table-cell",
  submitted_at: "hidden xl:table-cell",
};

interface UserPaymentGroupProps {
  userGroup: UserPaymentGroupType;
  isOpen: boolean;
  onToggle: () => void;
  onPaymentAction: (userGroup: UserPaymentGroupType, action: string) => Promise<void>;
}

const UserPaymentGroup: React.FC<UserPaymentGroupProps> = ({
  userGroup,
  isOpen,
  onToggle,
  onPaymentAction
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, submissions, paymentInfo } = userGroup;
  const buttonState = getPaymentButtonState(paymentInfo);

  const handlePaymentAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await onPaymentAction(userGroup, buttonState.action);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonStyles = () => {
    switch (buttonState.variant) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'secondary':
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    }
  };

  return (
    <div className="md:border-l-2 md:border-gray-100 md:ml-4 border-t md:border-t-0">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center hover:bg-gray-50 transition-colors duration-200 bg-gray-50/50">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-inset min-w-0"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {isOpen ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            )}
            
            <div className="flex items-center space-x-3 text-left flex-1 min-w-0">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </h4>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {submissions.length} submission{submissions.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Payment Button - Separated from toggle button */}
        <div className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-200">
          <button
            onClick={handlePaymentAction}
            disabled={buttonState.disabled || isProcessing}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${getButtonStyles()}`}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                {buttonState.text}
                {buttonState.sentAt && (
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                    {formatSentAt(buttonState.sentAt)}
                  </div>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Submissions */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-white">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            <div className="divide-y divide-gray-100">
              {submissions.map((item: CardType, index: number) => (
                <div key={item.id || index} className="p-3">
                  <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                    <div className="flex-1 min-w-0 mr-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.brand} • {item.year}
                      </p>
                    </div>
                    <span className="inline-flex flex-shrink-0">
                      <StatusBadge status={item.latest_status.status} />
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 mb-2">
                    <div className="truncate">
                      <span className="font-medium">Serial:</span> 
                      <span className="ml-1 break-all" title={item.serial_number}>
                        {item.serial_number}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Grade:</span> {item.grade}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> 
                      <span className="ml-1">
                        {formatDate(new Date(item.created_at))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link 
                      to={PATHS.DASHBOARD.ADMIN.SUBMISSION_DETAIL(String(item.id))}
                      className="inline-flex items-center px-2.5 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                      aria-label={`View submission ${item.name}`}
                    >
                      <BsEye className="mr-1 h-3 w-3" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View (md+) */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-full">
                <thead className="bg-gray-25 border-b border-gray-100">
                  <tr>
                    {fields.map(field => (
                      <th 
                        className={`py-2 px-3 lg:px-4 font-medium text-gray-600 whitespace-nowrap text-[11px] sm:text-xs ${colVisibility[field.name] || ''}`} 
                        key={field.name}
                      >
                        <span className="hidden lg:inline">{field.label}</span>
                        <span className="lg:hidden">{field.shortLabel}</span>
                      </th>
                    ))}
                    <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 whitespace-nowrap text-[11px] sm:text-xs">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((item: CardType, index: number) => (
                    <tr key={item.id || index} className="hover:bg-gray-25 transition-colors duration-150">
                      {/* name */}
                      <td className={`py-1.5 lg:py-2 px-3 lg:px-4 text-gray-800 ${colVisibility['name']}`}>
                        <div className="truncate max-w-32 md:max-w-40 lg:max-w-48 xl:max-w-none" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      {/* year */}
                      <td className={`py-1.5 lg:py-2 px-3 lg:px-4 whitespace-nowrap text-gray-600 text-xs ${colVisibility['year']}`}>
                        {item.year}
                      </td>
                      {/* brand */}
                      <td className={`py-1.5 lg:py-2 px-3 lg:px-4 text-gray-600 ${colVisibility['brand']}`}>
                        <div className="truncate max-w-20 md:max-w-28 lg:max-w-32 xl:max-w-none" title={item.brand}>
                          {item.brand}
                        </div>
                      </td>
                      {/* serial */}
                      <td className={`py-1.5 lg:py-2 px-3 lg:px-4 text-gray-600 ${colVisibility['serial_number']}`}>
                        <div className="truncate max-w-20 md:max-w-32 lg:max-w-40 xl:max-w-none" title={item.serial_number}>
                          {item.serial_number}
                        </div>
                      </td>
                      {/* grade */}
                      <td className={`py-1.5 lg:py-2 px-3 lg:px-4 whitespace-nowrap text-gray-600 text-xs ${colVisibility['grade']}`}>
                        {item.grade}
                      </td>
                      {/* status */}
                      <td className={`py-1.5 lg:py-2 px-3 lg:px-4 whitespace-nowrap ${colVisibility['status']}`}>
                        <StatusBadge status={item.latest_status.status} />
                      </td>
                      {/* submitted_at */}
                      <td className={`py-1.5 lg:py-2 px-3 lg:px-4 whitespace-nowrap text-gray-600 text-xs ${colVisibility['submitted_at']}`}>
                        <div className="truncate max-w-20 md:max-w-24 lg:max-w-none">
                          {formatDate(new Date(item.created_at))}
                        </div>
                      </td>
                      {/* detail */}
                      <td className="py-1.5 lg:py-2 px-3 lg:px-4 whitespace-nowrap">
                        <Link 
                          to={PATHS.DASHBOARD.ADMIN.SUBMISSION_DETAIL(String(item.id))}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-blue-50"
                          title="View Details"
                          aria-label={`View submission ${item.name}`}
                        >
                          <BsEye className="text-sm" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPaymentGroup;