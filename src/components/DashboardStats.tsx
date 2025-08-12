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

export default function DashboardStats({ onStatsLoad }: DashboardStatsProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [statsCards, setStatsCards] = useState<StatsCards>({
    totalSubmissions: 0,
    submittedCards: 0,
    acceptedCards: 0,
    rejectedCards: 0,
    onProcessCards: 0,
    doneCards: 0,
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

  // Process stats cards with new status categories including rejected
  const processStatsCards = useCallback((submissions: Submission[], users: User[]): StatsCards => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let submitted = 0;
    let accepted = 0;
    let rejected = 0;
    let onProcess = 0;
    let done = 0;

    submissions.forEach(submission => {
      const status = submission.latest_status.status.toLowerCase().trim();
      switch (status) {
        case 'submitted':
          submitted++;
          break;
        case 'accepted':
          accepted++;
          break;
        case 'rejected':
          rejected++;
          break;
        case 'on process':
          onProcess++;
          break;
        case 'done':
          done++;
          break;
        default:
          if (status.includes('submit')) {
            submitted++;
          } else if (status.includes('accept')) {
            accepted++;
          } else if (status.includes('reject')) {
            rejected++;
          } else if (status.includes('process') || status.includes('processing')) {
            onProcess++;
          } else if (status.includes('done') || status.includes('complete') || status.includes('finish')) {
            done++;
          }
          break;
      }
    });

    const totalUsers = users.filter(user => user.role === 'user').length;
    const newUsersThisMonth = users.filter(user => {
      const userDate = new Date(user.created_at);
      return user.role === 'user' && userDate >= currentMonthStart;
    }).length;

    return {
      totalSubmissions: submissions.length,
      submittedCards: submitted,
      acceptedCards: accepted,
      rejectedCards: rejected,
      onProcessCards: onProcess,
      doneCards: done,
      totalUsers,
      newUsersThisMonth,
    };
  }, []);

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
          onStatsLoad(stats);
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
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
        
        {/* Submitted Cards */}
        <div className="bg-orange-50 border border-orange-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-orange-800">
            {(statsCards?.submittedCards ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-orange-700 leading-tight">Submitted</p>
        </div>
        
        {/* Accepted Cards */}
        <div className="bg-yellow-50 border border-yellow-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-yellow-800">
            {(statsCards?.acceptedCards ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-yellow-700 leading-tight">Accepted</p>
        </div>
        
        {/* Rejected Cards */}
        <div className="bg-red-50 border border-red-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-red-800">
            {(statsCards?.rejectedCards ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-red-700 leading-tight">Rejected</p>
        </div>
        
        {/* On Process Cards */}
        <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-blue-800">
            {(statsCards?.onProcessCards ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-blue-700 leading-tight">
            <span className="hidden sm:inline">On Process</span>
            <span className="sm:hidden">Processing</span>
          </p>
        </div>
        
        {/* Done Cards */}
        <div className="bg-green-50 border border-green-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-green-800">
            {(statsCards?.doneCards ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-green-700 leading-tight">Done</p>
        </div>

        {/* Total Users */}
        <div className="bg-purple-50 border border-purple-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-purple-800">
            {(statsCards?.totalUsers ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-purple-700 leading-tight">
            <span className="hidden sm:inline">Total</span>
            <br className="sm:hidden" />
            <span>Users</span>
          </p>
        </div>

        {/* New Users This Month */}
        <div className="bg-indigo-50 border border-indigo-200 p-2 sm:p-3 lg:p-4 text-center rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 text-indigo-800">
            {(statsCards?.newUsersThisMonth ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-700 leading-tight">
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