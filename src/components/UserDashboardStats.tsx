import { useMemo } from "react";
import { getCardCategory } from "@/utils/statusUtils";
import type { Card } from "@/types/card.types";

interface UserStats {
  totalSubmitted: number;
  processing: number;
  grading: number;
  delivery: number;
  completed: number;
  rejected: number;
}

interface UserDashboardStatsProps {
  summaryCards: Card[] | undefined;
}

export default function UserDashboardStats({ summaryCards }: UserDashboardStatsProps) {
  const stats: UserStats = useMemo(() => {
    if (!summaryCards) {
      return { totalSubmitted: 0, processing: 0, grading: 0, delivery: 0, completed: 0, rejected: 0 };
    }
    return summaryCards.reduce((acc, card) => {
      const category = getCardCategory(card.latest_status.status);
      if (category !== 'unknown') {
        acc[category]++;
      }
      return acc;
    }, {
      totalSubmitted: summaryCards.length,
      processing: 0,
      grading: 0,
      delivery: 0,
      completed: 0,
      rejected: 0,
    });
  }, [summaryCards]);

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 mb-4 sm:mb-6 lg:mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-white border border-gray-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-gray-800">
            {(stats?.totalSubmitted ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-tight">
            <span className="hidden sm:inline">Total Cards</span>
            <br className="sm:hidden" />
            <span>Submitted</span>
          </p>
        </div>
        
        {/* Processing*/}
        <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-blue-800">
            {(stats?.processing ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-blue-700 leading-tight">Processing</p>
        </div>
        
        {/* Grading */}
        <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-yellow-800">
            {(stats?.grading ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-yellow-700 leading-tight">
            <br className="lg:hidden" />
            <span>Grading</span>
          </p>
        </div>
        
        {/* Delivery */}
        <div className="bg-green-50 border border-green-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-green-800">
            {(stats?.delivery ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-green-700 leading-tight">Delivery</p>
        </div>
        
        {/* Completed Cards */}
        <div className="bg-emerald-50 border border-emerald-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-emerald-800">
            {(stats?.completed ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-700 leading-tight">Completed</p>
        </div>
        
        {/* Rejected Cards */}
        <div className="bg-red-50 border border-red-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-red-800">
            {(stats?.rejected ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-red-700 leading-tight">Rejected</p>
        </div>
      </div>
    </div>
  );
}