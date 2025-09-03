import React from 'react';
import { Link } from 'react-router-dom';
import { BsEye } from 'react-icons/bs';
import { MdTrackChanges } from 'react-icons/md';
import formatDate from '@/utils/formatDate';
import StatusBadge from '@/components/StatusBadge';
import type { Card } from '@/types/card.types';
import { PATHS } from '@/routes/paths';

interface SubmissionListProps {
  cards: Card[];
}

const fields = [
  { label: "Name", name: "name" },
  { label: "Serial Number", name: "serial_number" },
  { label: "Verified Grade", name: "grade" },
  { label: "Batch", name: "batch" }, 
  { label: "Status", name: "status" },
  { label: "Submitted at", name: "submitted_at" },
];

const SubmissionList: React.FC<SubmissionListProps> = ({ cards }) => {
  const getStatusBadge = (status: string) => (
    <StatusBadge status={status} />
  );

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <MdTrackChanges className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">No submissions to track</p>
          <p className="text-xs sm:text-sm text-gray-500">You haven't submitted any cards yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {fields.map(field => (
                <th key={field.name} className="py-3 px-6 font-medium text-gray-700">
                  {field.label}
                </th>
              ))}
              <th className="py-3 px-6 font-medium text-gray-700 text-center">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="py-3 px-6 whitespace-nowrap text-gray-800 font-medium">{card.name}</td>
                <td className="py-3 px-6 whitespace-nowrap text-gray-600">{card.serial_number}</td>
                <td className="py-3 px-6 whitespace-nowrap">
                  {card.grade ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {card.grade}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-6 whitespace-nowrap text-gray-600">
                  {card.batch ? card.batch.batch_number : 'N/A'}
                </td>
                <td className="py-3 px-6 whitespace-nowrap">{getStatusBadge(card.latest_status?.status || 'Unknown')}</td>
                <td className="py-3 px-6 whitespace-nowrap text-gray-600">{formatDate(new Date(card.created_at))}</td>
                <td className="py-3 px-6 whitespace-nowrap text-center">
                  <Link
                    to={`${PATHS.DASHBOARD.USER.TRACKING}/${card.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    title="View Details"
                    aria-label={`View details for ${card.name}`}
                  >
                    <BsEye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-3 sm:space-y-4 p-3 sm:p-4">
        {cards.map((card) => (
          <div key={card.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-grow min-w-0">
                <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">{card.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{card.serial_number}</p>
              </div>
              <div className="flex-shrink-0 ml-3">{getStatusBadge(card.latest_status?.status || 'Unknown')}</div>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verified Grade</span>
                {card.grade ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">{card.grade}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Batch</span>
                <span className="text-gray-800 font-medium">
                    {card.batch ? card.batch.batch_number : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Submitted</span>
                <span className="text-gray-800">{formatDate(new Date(card.created_at))}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                to={`${PATHS.DASHBOARD.USER.TRACKING}/${card.id}`}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                aria-label={`View details for ${card.name}`}
              >
                <BsEye className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionList;