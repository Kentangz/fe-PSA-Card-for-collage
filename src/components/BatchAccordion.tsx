import { useState } from "react";
import { Link } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { MdAssignment } from "react-icons/md";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import formatDate from "../utils/FormatDate";
import type { CardType, BatchType } from "../types/submission";

// Field configuration for table headers
const fields = [
  {
    label: "Name",
    name: "name",
    shortLabel: "Name"
  },
  {
    label: "Year",
    name: "year",
    shortLabel: "Year"
  },
  {
    label: "Brand",
    name: "brand",
    shortLabel: "Brand"
  },
  {
    label: "Serial Number",
    name: "serial_number",
    shortLabel: "Serial"
  },
  {
    label: "Grade Target",
    name: "grade_target",
    shortLabel: "Grade"
  },
  {
    label: "Grade",
    name: "grade",
    shortLabel: "Grade"
  },
  {
    label: "Status",
    name: "status",
    shortLabel: "Status"
  },
  {
    label: "Submitted at",
    name: "submitted_at",
    shortLabel: "Date"
  },
];

const getStatusStyle = (status: string) => {
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case 'submitted':
      return 'bg-orange-100 text-orange-800';
    case 'accepted':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'on process':
    case 'processing':
    case 'in_process':
      return 'bg-blue-100 text-blue-800';
    case 'done':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      // Handle variations in status names
      if (normalizedStatus.includes('submit')) {
        return 'bg-orange-100 text-orange-800';
      } else if (normalizedStatus.includes('accept')) {
        return 'bg-yellow-100 text-yellow-800';
      } else if (normalizedStatus.includes('reject')) {
        return 'bg-red-100 text-red-800';
      } else if (normalizedStatus.includes('process')) {
        return 'bg-blue-100 text-blue-800';
      } else if (normalizedStatus.includes('done') || normalizedStatus.includes('complete')) {
        return 'bg-green-100 text-green-800';
      } else {
        return 'bg-gray-100 text-gray-800';
      }
  }
};

interface BatchAccordionProps {
  batch: BatchType;
  submissions: CardType[];
  isOpen: boolean;
  onToggle: () => void;
  onToggleBatchStatus: (batchId: number, currentStatus: boolean) => Promise<void>;
}

const BatchAccordion: React.FC<BatchAccordionProps> = ({ 
  batch, 
  submissions, 
  isOpen, 
  onToggle,
  onToggleBatchStatus 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const statusText = batch.is_active ? "Open" : "Closed";
  const statusStyle = batch.is_active 
    ? "bg-green-100 text-green-800" 
    : "bg-red-100 text-red-800";

  const handleToggleBatchStatus = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    setIsUpdating(true);
    try {
      await onToggleBatchStatus(batch.id, batch.is_active);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm mb-4 bg-white overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`batch-content-${batch.id}`}
      >
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {isOpen ? (
            <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
          )}
          
          {/* Desktop Header (lg and above) */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-left flex-1 min-w-0">
            <div className="min-w-0">
              <h3 className="text-lg xl:text-xl font-semibold text-gray-900 truncate">
                {batch.batch_number}
              </h3>
              <p className="text-sm text-gray-600 truncate">{batch.register_number}</p>
            </div>
            
            <div className="flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
              <span className="inline-flex px-2.5 py-1 text-xs xl:text-sm font-medium rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                {batch.category}
              </span>
              
              <span className={`inline-flex px-2.5 py-1 text-xs xl:text-sm font-medium rounded-full whitespace-nowrap ${statusStyle}`}>
                {statusText}
              </span>
              
              <span className="text-xs xl:text-sm text-gray-600 whitespace-nowrap">
                {submissions.length > 0 
                  ? `${submissions.length} submission${submissions.length > 1 ? 's' : ''}` 
                  : 'No submissions'
                }
              </span>
            </div>
          </div>

          {/* Tablet Header (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center justify-between text-left flex-1 min-w-0">
            <div className="min-w-0 flex-1 mr-4">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {batch.batch_number}
              </h3>
              <p className="text-sm text-gray-600 truncate">{batch.register_number}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {batch.category}
                </span>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle}`}>
                  {statusText}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500">
                {submissions.length > 0 
                  ? `${submissions.length} submission${submissions.length > 1 ? 's' : ''}` 
                  : 'No submissions'
                }
              </p>
            </div>
          </div>

          {/* Mobile Header (sm and below) */}
          <div className="md:hidden text-left flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
              {batch.batch_number}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{batch.register_number}</p>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 truncate max-w-20">
                {batch.category}
              </span>
              <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${statusStyle}`}>
                {statusText}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {submissions.length > 0 
                ? `${submissions.length} item${submissions.length > 1 ? 's' : ''}` 
                : 'Empty'
              }
            </p>
          </div>
        </div>

        {/* Toggle Batch Status Button */}
        <div className="flex items-center ml-2 sm:ml-4 flex-shrink-0">
          <button
            onClick={handleToggleBatchStatus}
            disabled={isUpdating}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
              batch.is_active
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-current"></div>
                <span className="hidden sm:inline">Updating...</span>
                <span className="sm:hidden">...</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">
                  {batch.is_active ? 'Close Batch' : 'Open Batch'}
                </span>
                <span className="sm:hidden">
                  {batch.is_active ? 'Close' : 'Open'}
                </span>
              </>
            )}
          </button>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div 
          id={`batch-content-${batch.id}`}
          className="border-t border-gray-200 animate-in slide-in-from-top-2 duration-200"
        >
          {submissions.length === 0 ? (
            <div className="py-8 sm:py-12 text-center text-gray-500">
              <MdAssignment className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base">Belum ada submission</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View (sm and below) */}
              <div className="block md:hidden">
                <div className="divide-y divide-gray-200">
                  {submissions.map((item: CardType, index: number) => (
                    <div key={item.id || index} className="p-3 sm:p-4">
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                            {item.brand} • {item.year}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getStatusStyle(item.latest_status.status)}`}>
                          <span className="truncate max-w-16">
                            {item.latest_status.status}
                          </span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600 mb-2 sm:mb-3">
                        <div className="truncate">
                          <span className="font-medium">Serial:</span> 
                          <span className="ml-1" title={item.serial_number}>
                            {item.serial_number}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Target:</span> {item.grade_target}
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
                          to={`/dashboard/admin/submissions/${item.id}`}
                          className="inline-flex items-center px-2.5 sm:px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                          <BsEye className="mr-1 h-3 w-3" />
                          <span className="hidden xs:inline">View Details</span>
                          <span className="xs:hidden">View</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tablet and Desktop Table View (md and above) */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {fields.map(field => (
                          <th 
                            className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 font-medium text-gray-700 whitespace-nowrap text-xs md:text-sm" 
                            key={field.name}
                          >
                            <span className="hidden lg:inline">{field.label}</span>
                            <span className="lg:hidden">{field.shortLabel}</span>
                          </th>
                        ))}
                        <th className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 font-medium text-gray-700 whitespace-nowrap text-xs md:text-sm">
                          Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((item: CardType, index: number) => (
                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 text-gray-800">
                            <div className="truncate max-w-32 md:max-w-40 lg:max-w-48 xl:max-w-none" title={item.name}>
                              {item.name}
                            </div>
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 whitespace-nowrap text-gray-600 text-xs md:text-sm">
                            {item.year}
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 text-gray-600">
                            <div className="truncate max-w-20 md:max-w-28 lg:max-w-32 xl:max-w-none" title={item.brand}>
                              {item.brand}
                            </div>
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 text-gray-600">
                            <div className="truncate max-w-20 md:max-w-32 lg:max-w-40 xl:max-w-none" title={item.serial_number}>
                              {item.serial_number}
                            </div>
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 whitespace-nowrap text-gray-600 text-xs md:text-sm">
                            {item.grade_target}
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 whitespace-nowrap text-gray-600 text-xs md:text-sm">
                            {item.grade}
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                            <span className={`inline-flex px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-medium rounded-full ${getStatusStyle(item.latest_status.status)}`}>
                              <span className="truncate max-w-20 md:max-w-none">
                                {item.latest_status.status}
                              </span>
                            </span>
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 whitespace-nowrap text-gray-600 text-xs md:text-sm">
                            <div className="truncate max-w-20 md:max-w-24 lg:max-w-none">
                              {formatDate(new Date(item.created_at))}
                            </div>
                          </td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 lg:px-6 whitespace-nowrap">
                            <Link 
                              to={`/dashboard/admin/submissions/${item.id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-blue-50"
                              title="View Details"
                            >
                              <BsEye className="text-sm md:text-base" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchAccordion;