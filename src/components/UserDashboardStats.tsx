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
  // Calculate statistics from cards data
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
          // Handle variations in status names
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
    <div className="flex gap-2 flex-wrap mb-8">
      <div className="bg-white border border-gray-200 w-60 p-4 text-center rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">{stats.totalSubmitted}</h2>
        <p className="text-sm text-gray-600">total cards submitted</p>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 w-60 p-4 text-center rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold mb-2 text-orange-800">{stats.submitted}</h2>
        <p className="text-sm text-orange-600">submitted</p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 w-60 p-4 text-center rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold mb-2 text-yellow-800">{stats.accepted}</h2>
        <p className="text-sm text-yellow-600">accepted</p>
      </div>
      
      <div className="bg-red-50 border border-red-200 w-60 p-4 text-center rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold mb-2 text-red-800">{stats.rejected}</h2>
        <p className="text-sm text-red-600">rejected</p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 w-60 p-4 text-center rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold mb-2 text-blue-800">{stats.inProcess}</h2>
        <p className="text-sm text-blue-600">on process</p>
      </div>
      
      <div className="bg-green-50 border border-green-200 w-60 p-4 text-center rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold mb-2 text-green-800">{stats.done}</h2>
        <p className="text-sm text-green-600">done</p>
      </div>
    </div>
  );
}