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
  processing: number;
  psaGrading: number;
  delivery: number;
  completed: number;
  rejected: number;
};

interface UserDashboardStatsProps {
  cards: CardType[] | undefined;
}

// Timeline phases mapping - Simplified for User (Processing, PSA Grading, Delivery)
const TIMELINE_PHASES = [
  {
    id: "processing",
    title: "Processing",
    statuses: [
      // Initial Processing
      "submit", "received_by_us", "data_input", "delivery_to_jp",
      // Japan Warehouse  
      "received_by_jp_wh", "delivery_to_psa"
    ],
    color: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
    }
  },
  {
    id: "psa_grading",
    title: "PSA Grading",
    statuses: [
      "psa_arrival_of_submission",
      "psa_order_processed",
      "psa_research",
      "psa_grading",
      "psa_holder_sealed",
      "psa_qc",
      "psa_grading_completed",
      "psa_completion"
    ],
    color: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
    }
  },
  {
    id: "delivery",
    title: "Delivery",
    statuses: [
      // Return Process
      "delivery_to_jp_wh", "waiting_to_delivery_to_id", "delivery_process_to_id",
      // Final Delivery
      "received_by_wh_id", "payment_request", "delivery_to_customer", "received_by_customer"
    ],
    color: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
    }
  }
];

export default function UserDashboardStats({ cards }: UserDashboardStatsProps) {
  const stats: UserStatsCards = useMemo(() => {
    if (!cards || cards.length === 0) {
      return { 
        totalSubmitted: 0,
        processing: 0,
        psaGrading: 0,
        delivery: 0,
        completed: 0,
        rejected: 0
      };
    }

    // Helper function to normalize status for comparison
    const normalizeStatus = (status: string): string => {
      return status.toLowerCase().trim().replace(/\s+/g, '_');
    };

    // Helper function to check if status belongs to a phase
    const isStatusInPhase = (status: string, phaseStatuses: string[]): boolean => {
      const normalizedStatus = normalizeStatus(status);
      return phaseStatuses.some(phaseStatus => {
        const normalizedPhaseStatus = normalizeStatus(phaseStatus);
        return normalizedStatus === normalizedPhaseStatus ||
               normalizedStatus.includes(normalizedPhaseStatus) ||
               normalizedPhaseStatus.includes(normalizedStatus);
      });
    };
    
    const cardStats = cards.reduce((acc, card) => {
      const status = card.latest_status?.status || '';
      
      acc.totalSubmitted += 1;
      
      // Check each phase - Simplified for User (Processing, PSA Grading, Delivery)
      const processingPhase = TIMELINE_PHASES.find(p => p.id === "processing");
      const psaGradingPhase = TIMELINE_PHASES.find(p => p.id === "psa_grading");
      const deliveryPhase = TIMELINE_PHASES.find(p => p.id === "delivery");
      
      if (processingPhase && isStatusInPhase(status, processingPhase.statuses)) {
        acc.processing += 1;
      } else if (psaGradingPhase && isStatusInPhase(status, psaGradingPhase.statuses)) {
        acc.psaGrading += 1;
      } else if (deliveryPhase && isStatusInPhase(status, deliveryPhase.statuses)) {
        acc.delivery += 1;
      } else if (normalizeStatus(status).includes('done') || normalizeStatus(status).includes('complete')) {
        acc.completed += 1;
      } else if (normalizeStatus(status).includes('reject')) {
        acc.rejected += 1;
      } else {
        // Fallback: try to match with common patterns
        const normalizedStatus = normalizeStatus(status);
        if (normalizedStatus.includes('submit') || normalizedStatus.includes('received_by_us')) {
          acc.processing += 1;
        } else if (normalizedStatus.includes('psa')) {
          acc.psaGrading += 1;
        } else if (normalizedStatus.includes('delivery') || normalizedStatus.includes('return')) {
          acc.delivery += 1;
        } else {
          // Default to processing for unknown statuses
          acc.processing += 1;
        }
      }
      
      return acc;
    }, { 
      totalSubmitted: 0,
      processing: 0,
      psaGrading: 0,
      delivery: 0,
      completed: 0,
      rejected: 0
    });

    return cardStats;
  }, [cards]);

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 mb-4 sm:mb-6 lg:mb-8">
      {/* Stats Cards - Simplified for User: Processing, PSA Grading, Delivery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
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
        
        {/* Processing */}
        <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-blue-800">
            {(stats?.processing ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-blue-700 leading-tight">Processing</p>
        </div>
        
        {/* PSA Grading */}
        <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-yellow-800">
            {(stats?.psaGrading ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-yellow-700 leading-tight">
            <span className="hidden lg:inline">PSA</span>
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