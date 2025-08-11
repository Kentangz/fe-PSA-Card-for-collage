import { useState, useEffect, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import axiosInstance from "../lib/axiosInstance";
import type { User, Submission, MonthlyData, StatsCards, DashboardStatsProps } from "../types/admindashboard";

// Define types for API responses
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
    onProcessCards: 0,
    doneCards: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate month labels for the last 6 months
  const generateMonthLabels = (): string[] => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    return months;
  };

  // Process monthly data - wrapped in useCallback to fix dependency issue
  const processMonthlyData = useCallback((submissions: Submission[], users: User[]): MonthlyData[] => {
    const monthLabels = generateMonthLabels();
    const now = new Date();
    
    const monthlyStats = monthLabels.map((month, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index) + 1, 1);
      
      // Count submissions for this month
      const submissionsCount = submissions.filter(submission => {
        const submissionDate = new Date(submission.created_at);
        return submissionDate >= monthDate && submissionDate < nextMonthDate;
      }).length;

      // Count new users for this month (only users with role 'user')
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

  // Process stats cards with new status categories
  const processStatsCards = useCallback((submissions: Submission[], users: User[]): StatsCards => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count submissions by the 4 specific status phases
    let submitted = 0;
    let accepted = 0;
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
        case 'on process':
          onProcess++;
          break;
        case 'done':
          done++;
          break;
        default:
          // Handle other possible status values by categorizing them
          if (status.includes('submit')) {
            submitted++;
          } else if (status.includes('accept')) {
            accepted++;
          } else if (status.includes('process') || status.includes('processing')) {
            onProcess++;
          } else if (status.includes('done') || status.includes('complete') || status.includes('finish')) {
            done++;
          }
          break;
      }
    });

    // Count users (only role 'user')
    const totalUsers = users.filter(user => user.role === 'user').length;
    const newUsersThisMonth = users.filter(user => {
      const userDate = new Date(user.created_at);
      return user.role === 'user' && userDate >= currentMonthStart;
    }).length;

    return {
      totalSubmissions: submissions.length,
      submittedCards: submitted,
      acceptedCards: accepted,
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

        // Fetch both submissions and users data with proper typing
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

        // Process users data with type safety
        let users: User[] = [];
        const usersData = usersResponse.data;
        
        if (Array.isArray(usersData)) {
          users = usersData;
        } else if (usersData && typeof usersData === 'object' && 'data' in usersData && Array.isArray(usersData.data)) {
          users = usersData.data;
        }

        // Generate monthly chart data
        const monthlyStats = processMonthlyData(submissions, users);
        setMonthlyData(monthlyStats);

        // Generate stats cards data
        const stats = processStatsCards(submissions, users);
        setStatsCards(stats);

        // Callback to parent component if provided
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
  }, [onStatsLoad, processMonthlyData, processStatsCards]); // Added missing dependencies

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for stats cards */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse w-60 h-24 rounded-lg"></div>
          ))}
        </div>
        
        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
          <div className="bg-gray-200 animate-pulse h-80 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading dashboard data</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Updated to show 4 status phases + total + users */}
      <div className="flex gap-2 flex-wrap">
        <div className="bg-white border border-gray-200 w-60 p-4 text-center rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">{statsCards.totalSubmissions}</h2>
          <p className="text-sm text-gray-600">total submissions</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 w-60 p-4 text-center rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-orange-800">{statsCards.submittedCards}</h2>
          <p className="text-sm text-orange-600">submitted</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 w-60 p-4 text-center rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-yellow-800">{statsCards.acceptedCards}</h2>
          <p className="text-sm text-yellow-600">accepted</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 w-60 p-4 text-center rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-blue-800">{statsCards.onProcessCards}</h2>
          <p className="text-sm text-blue-600">on process</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 w-60 p-4 text-center rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-green-800">{statsCards.doneCards}</h2>
          <p className="text-sm text-green-600">done</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 w-60 p-4 text-center rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-purple-800">{statsCards.totalUsers}</h2>
          <p className="text-sm text-purple-600">total users</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 w-60 p-4 text-center rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-2 text-indigo-800">{statsCards.newUsersThisMonth}</h2>
          <p className="text-sm text-indigo-600">new users this month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Submissions Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h4 className="mb-4 text-lg font-medium text-gray-800">Monthly Submissions</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'submissions' ? 'Submissions' : 'Users']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="submissions" fill="#3B82F6" name="submissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly New Users Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h4 className="mb-4 text-lg font-medium text-gray-800">New Users per Month</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'users' ? 'New Users' : 'Submissions']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="users" fill="#10B981" name="users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}