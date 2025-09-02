import React from 'react';
import { MdAssignmentAdd } from 'react-icons/md';
import formatDate from '@/utils/FormatDate';
import StatusBadge from '@/components/StatusBadge';
import type { Card } from '@/types/card.types';

interface SubmissionHistoryProps {
  submissions: Card[] | undefined;
}

const fields = [
  { label: "Name", name: "name" },
  { label: "Year", name: "year" },
  { label: "Brand", name: "brand" },
  { label: "Serial Number", name: "serial_number" },
  // { label: "Grade Target", name: "grade_target" },
  { label: "Grade", name: "grade" },
  { label: "Status", name: "status" },
  { label: "Submitted at", name: "created_at" },
];

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ submissions }) => {
  return (
    <div className="w-full">
      <h5 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">
        <span className="hidden sm:inline">Submission History</span>
        <span className="sm:hidden">History</span>
      </h5>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {submissions && submissions.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {fields.map(field => (
                      <th key={field.name} className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{card.name}</td>
                      <td className="py-3 px-4 text-gray-600">{card.year}</td>
                      <td className="py-3 px-4 text-gray-600">{card.brand}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{card.serial_number}</td>
                      {/* <td className="py-3 px-4 text-gray-600 font-medium">{card.grade_target}</td> */}
                      <td className="py-3 px-4 text-gray-600 font-medium">{card.grade ?? '-'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={card.latest_status?.status || ''} />
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {formatDate(new Date(card.created_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-gray-200">
              {submissions.map((card) => (
                <div key={card.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h6 className="font-medium text-gray-800 truncate pr-2">{card.name}</h6>
                      <span className="flex-shrink-0">
                        <StatusBadge status={card.latest_status?.status || ''} />
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="ml-1 text-gray-800">{card.brand}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Year:</span>
                        <span className="ml-1 text-gray-800">{card.year}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Serial:</span>
                        <span className="ml-1 text-gray-800 font-mono text-xs">{card.serial_number}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        {/* <span className="ml-1 text-gray-800 font-medium">{card.grade_target}</span> */}
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-1 text-gray-800 text-xs">{formatDate(new Date(card.created_at))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <MdAssignmentAdd className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2 text-sm sm:text-base">No submissions yet</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Start by selecting a batch to create a new submission.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionHistory;