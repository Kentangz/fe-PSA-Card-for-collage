import { useMemo } from "react";

export type CardType = {
  id: string;
  user_id: number;
  name: string;
  year: number;
  brand: string;
  serial_number: string;
  latest_status: { 
    id: number;
    card_id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  grade_target: string;
  grade: string | null;
  created_at: string;
  updated_at: string;
};

type UserStatsCards = {
  totalSubmitted: number;
  submitted: number;
  accepted: number;
  rejected: number;
  inProcess: number;
  done: number;
};

interface UserDashboardStatsProps {
  cards: CardType[] | undefined;
}

export default function UserDashboardStats({ cards }: UserDashboardStatsProps) {
  const stats: UserStatsCards = useMemo(() => {
    if (!cards || cards.length === 0) {
      return { 
        totalSubmitted: 0, 
        submitted: 0, 
        accepted: 0, 
        rejected: 0, 
        inProcess: 0, 
        done: 0 
      };
    }
    
    const cardStats = cards.reduce((acc, card) => {
      const status = card.latest_status?.status?.toLowerCase().trim() || '';
      
      acc.totalSubmitted += 1;
      
      switch (status) {
        case 'submitted':
          acc.submitted += 1;
          break;
        case 'accepted':
          acc.accepted += 1;
          break;
        case 'rejected':
          acc.rejected += 1;
          break;
        case 'on process':
          acc.inProcess += 1;
          break;
        case 'done':
          acc.done += 1;
          break;
        default:

          if (status.includes('submit')) {
            acc.submitted += 1;
          } else if (status.includes('accept')) {
            acc.accepted += 1;
          } else if (status.includes('reject')) {
            acc.rejected += 1;
          } else if (status.includes('process') || status.includes('processing')) {
            acc.inProcess += 1;
          } else if (status.includes('done') || status.includes('complete') || status.includes('finish')) {
            acc.done += 1;
          }
          break;
      }
      
      return acc;
    }, { 
      totalSubmitted: 0, 
      submitted: 0, 
      accepted: 0, 
      rejected: 0, 
      inProcess: 0, 
      done: 0 
    });

    return cardStats;
  }, [cards]);

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 mb-4 sm:mb-6 lg:mb-8">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {/* Total Cards Submitted */}
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
        
        {/* Submitted Cards */}
        <div className="bg-orange-50 border border-orange-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-orange-800">
            {(stats?.submitted ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-orange-700 leading-tight">Submitted</p>
        </div>
        
        {/* Accepted Cards */}
        <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-yellow-800">
            {(stats?.accepted ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-yellow-700 leading-tight">Accepted</p>
        </div>
        
        {/* Rejected Cards */}
        <div className="bg-red-50 border border-red-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-red-800">
            {(stats?.rejected ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-red-700 leading-tight">Rejected</p>
        </div>
        
        {/* On Process Cards */}
        <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-blue-800">
            {(stats?.inProcess ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-blue-700 leading-tight">
            <span className="hidden sm:inline">On Process</span>
            <span className="sm:hidden">Processing</span>
          </p>
        </div>
        
        {/* Done Cards */}
        <div className="bg-green-50 border border-green-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-green-800">
            {(stats?.done ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-green-700 leading-tight">Done</p>
        </div>
      </div>
    </div>
  );
}