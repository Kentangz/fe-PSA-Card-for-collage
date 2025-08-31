import { useState, useEffect, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import axiosInstance from "../lib/axiosInstance";
import type { User, Submission, MonthlyData, StatsCards, DashboardStatsProps } from "../types/admindashboard";

interface SubmissionsApiResponse {
  data?: Submission[];
  cards?: Submission[];
}

interface UsersApiResponse {
  data?: User[];
}

interface NewStatsCards {
  totalSubmissions: number;
  initialProcessing: number;
  japanWarehouse: number;
  psaGrading: number;
  returnProcess: number;
  finalDelivery: number;
  completed: number;
  rejected: number;
  totalUsers: number;
  newUsersThisMonth: number;
}

// Timeline phases mapping from AdminTimeline.tsx
const TIMELINE_PHASES = {
  initial: ["submit", "received_by_us", "data_input", "delivery_to_jp"],
  japan_wh: ["received_by_jp_wh", "delivery_to_psa"],
  psa_grading: [
    "psa_arrival_of_submission",
    "psa_order_processed", 
    "psa_research",
    "psa_grading",
    "psa_holder_sealed",
    "psa_qc",
    "psa_grading_completed",
    "psa_completion"
  ],
  return_process: ["delivery_to_jp_wh", "waiting_to_delivery_to_id", "delivery_process_to_id"],
  final_delivery: ["received_by_wh_id", "payment_request", "delivery_to_customer", "received_by_customer"],
  completion: ["done"],
  rejected: ["rejected"]
};

export default function DashboardStats({ onStatsLoad }: DashboardStatsProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [statsCards, setStatsCards] = useState<NewStatsCards>({
    totalSubmissions: 0,
    initialProcessing: 0,
    japanWarehouse: 0,
    psaGrading: 0,
    returnProcess: 0,
    finalDelivery: 0,
    completed: 0,
    rejected: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMonthLabels = (): string[] => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    return months;
  };

  const processMonthlyData = useCallback((submissions: Submission[], users: User[]): MonthlyData[] => {
    const monthLabels = generateMonthLabels();
    const now = new Date();
    
    const monthlyStats = monthLabels.map((month, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index) + 1, 1);
      
      const submissionsCount = submissions.filter(submission => {
        const submissionDate = new Date(submission.created_at);
        return submissionDate >= monthDate && submissionDate < nextMonthDate;
      }).length;

      const usersCount = users.filter(user => {
        const userDate = new Date(user.created_at);
        return user.role === 'user' && userDate >= monthDate && userDate < nextMonthDate;
      }).length;

      return {
        month,
        submissions: submissionsCount,
        users: usersCount,
      };
    });

    return monthlyStats;
  }, []);

  // Helper function to normalize status for comparison
  const normalizeStatus = useCallback((status: string): string => {
    return status.toLowerCase().trim().replace(/\s+/g, '_');
  }, []);

  // Helper function to check if status belongs to a phase
  const isStatusInPhase = useCallback((status: string, phaseStatuses: string[]): boolean => {
    const normalizedStatus = normalizeStatus(status);
    return phaseStatuses.some(phaseStatus => {
      const normalizedPhaseStatus = normalizeStatus(phaseStatus);
      return normalizedStatus === normalizedPhaseStatus ||
             normalizedStatus.includes(normalizedPhaseStatus) ||
             normalizedPhaseStatus.includes(normalizedStatus);
    });
  }, [normalizeStatus]);

  // Process stats cards with new phase-based categories
  const processStatsCards = useCallback((submissions: Submission[], users: User[]): NewStatsCards => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let initialProcessing = 0;
    let japanWarehouse = 0;
    let psaGrading = 0;
    let returnProcess = 0;
    let finalDelivery = 0;
    let completed = 0;
    let rejected = 0;

    submissions.forEach(submission => {
      const status = submission.latest_status.status;
      
      // Check each phase
      if (isStatusInPhase(status, TIMELINE_PHASES.initial)) {
        initialProcessing++;
      } else if (isStatusInPhase(status, TIMELINE_PHASES.japan_wh)) {
        japanWarehouse++;
      } else if (isStatusInPhase(status, TIMELINE_PHASES.psa_grading)) {
        psaGrading++;
      } else if (isStatusInPhase(status, TIMELINE_PHASES.return_process)) {
        returnProcess++;
      } else if (isStatusInPhase(status, TIMELINE_PHASES.final_delivery)) {
        finalDelivery++;
      } else if (isStatusInPhase(status, TIMELINE_PHASES.completion)) {
        completed++;
      } else if (isStatusInPhase(status, TIMELINE_PHASES.rejected)) {
        rejected++;
      } else {
        // Fallback: try to match with common patterns
        const normalizedStatus = normalizeStatus(status);
        if (normalizedStatus.includes('submit') || normalizedStatus.includes('received_by_us')) {
          initialProcessing++;
        } else if (normalizedStatus.includes('psa')) {
          psaGrading++;
        } else if (normalizedStatus.includes('delivery') || normalizedStatus.includes('return')) {
          returnProcess++;
        } else if (normalizedStatus.includes('done') || normalizedStatus.includes('complete')) {
          completed++;
        } else if (normalizedStatus.includes('reject')) {
          rejected++;
        } else {
          // Default to initial processing for unknown statuses
          initialProcessing++;
        }
      }
    });

    const totalUsers = users.filter(user => user.role === 'user').length;
    const newUsersThisMonth = users.filter(user => {
      const userDate = new Date(user.created_at);
      return user.role === 'user' && userDate >= currentMonthStart;
    }).length;

    return {
      totalSubmissions: submissions.length,
      initialProcessing,
      japanWarehouse,
      psaGrading,
      returnProcess,
      finalDelivery,
      completed,
      rejected,
      totalUsers,
      newUsersThisMonth,
    };
  }, [isStatusInPhase, normalizeStatus]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [submissionsResponse, usersResponse] = await Promise.all([
          axiosInstance.get<SubmissionsApiResponse | Submission[]>("/card"),
          axiosInstance.get<UsersApiResponse | User[]>("/users")
        ]);

        // Process submissions data with type safety
        let submissions: Submission[] = [];
        const submissionsData = submissionsResponse.data;
        
        if (Array.isArray(submissionsData)) {
          submissions = submissionsData;
        } else if (submissionsData && typeof submissionsData === 'object') {
          if ('data' in submissionsData && Array.isArray(submissionsData.data)) {
            submissions = submissionsData.data;
          } else if ('cards' in submissionsData && Array.isArray(submissionsData.cards)) {
            submissions = submissionsData.cards;
          }
        }

        let users: User[] = [];
        const usersData = usersResponse.data;
        
        if (Array.isArray(usersData)) {
          users = usersData;
        } else if (usersData && typeof usersData === 'object' && 'data' in usersData && Array.isArray(usersData.data)) {
          users = usersData.data;
        }

        const monthlyStats = processMonthlyData(submissions, users);
        setMonthlyData(monthlyStats);

        const stats = processStatsCards(submissions, users);
        setStatsCards(stats);

        if (onStatsLoad) {
          // Convert NewStatsCards to original StatsCards format for compatibility
          const compatibleStats: StatsCards = {
            totalSubmissions: stats.totalSubmissions,
            submittedCards: stats.initialProcessing, // Map initial processing to submitted
            acceptedCards: 0, // No longer used, set to 0
            rejectedCards: stats.rejected,
            onProcessCards: stats.japanWarehouse + stats.psaGrading + stats.returnProcess + stats.finalDelivery, // Sum of all processing phases
            doneCards: stats.completed,
            totalUsers: stats.totalUsers,
            newUsersThisMonth: stats.newUsersThisMonth,
          };
          onStatsLoad(compatibleStats);
        }

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [onStatsLoad, processMonthlyData, processStatsCards]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Loading skeleton for stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-16 sm:h-20 lg:h-24 rounded-lg"></div>
          ))}
        </div>
        
        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-gray-200 animate-pulse h-48 sm:h-64 lg:h-80 rounded-lg"></div>
          <div className="bg-gray-200 animate-pulse h-48 sm:h-64 lg:h-80 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-48 sm:min-h-64 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-lg sm:text-xl font-semibold mb-2">Error loading data</div>
          <div className="text-gray-600 text-sm sm:text-base break-words">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Stats Cards - Updated with Phase-based Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {/* Total Submissions */}
        <div className="bg-white border border-gray-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-gray-800">
            {(statsCards?.totalSubmissions ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-tight">
            <span className="hidden sm:inline">Total</span>
            <br className="sm:hidden" />
            <span>Submissions</span>
          </p>
        </div>
        
        {/* Initial Processing */}
        <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-blue-800">
            {(statsCards?.initialProcessing ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-blue-700 leading-tight">
            <span className="hidden lg:inline">Initial</span>
            <br className="lg:hidden" />
            <span>Processing</span>
          </p>
        </div>
        
        {/* Japan Warehouse */}
        <div className="bg-purple-50 border border-purple-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-purple-800">
            {(statsCards?.japanWarehouse ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-purple-700 leading-tight">
            <span className="hidden lg:inline">Japan</span>
            <br className="lg:hidden" />
            <span>Warehouse</span>
          </p>
        </div>
        
        {/* Grading */}
        <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-yellow-800">
            {(statsCards?.psaGrading ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-yellow-700 leading-tight">
            <span className="hidden lg:inline">PSA</span>
            <br className="lg:hidden" />
            <span>Grading</span>
          </p>
        </div>
        
        {/* Return Process */}
        <div className="bg-orange-50 border border-orange-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-orange-800">
            {(statsCards?.returnProcess ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-orange-700 leading-tight">
            <span className="hidden lg:inline">Return</span>
            <br className="lg:hidden" />
            <span>Process</span>
          </p>
        </div>
        
        {/* Final Delivery */}
        <div className="bg-teal-50 border border-teal-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-teal-800">
            {(statsCards?.finalDelivery ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-teal-700 leading-tight">
            <span className="hidden lg:inline">Final</span>
            <br className="lg:hidden" />
            <span>Delivery</span>
          </p>
        </div>
        
        {/* Completed */}
        <div className="bg-green-50 border border-green-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-green-800">
            {(statsCards?.completed ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-green-700 leading-tight">Completed</p>
        </div>
        
        {/* Rejected */}
        <div className="bg-red-50 border border-red-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-red-800">
            {(statsCards?.rejected ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-red-700 leading-tight">Rejected</p>
        </div>

        {/* Total Users */}
        <div className="bg-indigo-50 border border-indigo-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-indigo-800">
            {(statsCards?.totalUsers ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-700 leading-tight">
            <span className="hidden sm:inline">Total</span>
            <br className="sm:hidden" />
            <span>Users</span>
          </p>
        </div>

        {/* New Users This Month */}
        <div className="bg-pink-50 border border-pink-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-pink-800">
            {(statsCards?.newUsersThisMonth ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-pink-700 leading-tight">
            <span className="hidden lg:inline">New This Month</span>
            <span className="lg:hidden">New Users</span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Monthly Submissions Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
              <span className="hidden sm:inline">Monthly Submissions</span>
              <span className="sm:hidden">Submissions</span>
            </h4>
            <div className="text-xs sm:text-sm text-gray-500">Last 6 months</div>
          </div>
          
          <div className="h-48 sm:h-64 lg:h-72 xl:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyData} 
                margin={{ 
                  top: 10, 
                  right: 10, 
                  left: 10, 
                  bottom: 10 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval={0}
                  height={40}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  width={40}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    value.toLocaleString(), 
                    name === 'submissions' ? 'Submissions' : 'Users'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  dataKey="submissions" 
                  fill="#3B82F6" 
                  name="submissions"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly New Users Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
              <span className="hidden sm:inline">New Users</span>
              <span className="sm:hidden">Users</span>
            </h4>
            <div className="text-xs sm:text-sm text-gray-500">Last 6 months</div>
          </div>
          
          <div className="h-48 sm:h-64 lg:h-72 xl:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyData} 
                margin={{ 
                  top: 10, 
                  right: 10, 
                  left: 10, 
                  bottom: 10 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval={0}
                  height={40}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  width={40}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    value.toLocaleString(), 
                    name === 'users' ? 'New Users' : 'Submissions'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  dataKey="users" 
                  fill="#10B981" 
                  name="users"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}