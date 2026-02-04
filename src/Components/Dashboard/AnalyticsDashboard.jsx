import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalMeetings: 0,
    totalExpenses: 0,
    teamMembers: 0,
    avgTaskCompletionTime: 0,
    productivityScore: 0
  });
  
  const [taskData, setTaskData] = useState([]);
  const [meetingData, setMeetingData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchAnalyticsData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      // Fetch all data in parallel
      await Promise.all([
        fetchTaskMetrics(user.id),
        fetchMeetingMetrics(user.id),
        fetchExpenseMetrics(user.id),
        fetchTaskCompletionData(user.id),
        fetchMeetingAttendanceData(user.id),
        fetchExpenseTrends(user.id),
        fetchTeamPerformance(user.id),
        fetchRecentActivity(user.id)
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  const fetchTaskMetrics = async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (!error && data) {
      const total = data.length;
      const completed = data.filter(task => task.status === 'completed').length;
      const pending = data.filter(task => task.status === 'pending').length;
      
      // Calculate average completion time
      const completedTasks = data.filter(task => task.status === 'completed' && task.completed_at);
      const avgTime = completedTasks.length > 0 
        ? completedTasks.reduce((acc, task) => {
            const created = new Date(task.created_at);
            const completed = new Date(task.completed_at);
            return acc + (completed - created) / (1000 * 60 * 60); // hours
          }, 0) / completedTasks.length
        : 0;

      setMetrics(prev => ({
        ...prev,
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        avgTaskCompletionTime: avgTime.toFixed(1),
        productivityScore: total > 0 ? Math.round((completed / total) * 100) : 0
      }));
    }
  };

  const fetchMeetingMetrics = async (userId) => {
    const now = new Date();
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', userId);

    if (!error && data) {
      const total = data.length;
      const upcoming = data.filter(meeting => new Date(meeting.start_time) > now).length;
      
      setMetrics(prev => ({
        ...prev,
        totalMeetings: total,
        upcomingMeetings: upcoming
      }));
    }
  };

  const fetchExpenseMetrics = async (userId) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', userId);

    if (!error && data) {
      const total = data.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Group by category
      const byCategory = data.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + (expense.amount || 0);
        return acc;
      }, {});

      setMetrics(prev => ({
        ...prev,
        totalExpenses: total
      }));

      // Prepare expense data for chart
      const expenseChartData = Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount: Math.round(amount)
      }));
      setExpenseData(expenseChartData);
    }
  };

  const fetchTaskCompletionData = async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('created_at, completed_at, status')
      .eq('user_id', userId)
      .gte('created_at', getDateRange(timeRange))
      .order('created_at', { ascending: true });

    if (!error && data) {
      // Group by date
      const grouped = data.reduce((acc, task) => {
        const date = new Date(task.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, completed: 0, pending: 0, total: 0 };
        }
        acc[date].total++;
        if (task.status === 'completed') {
          acc[date].completed++;
        } else {
          acc[date].pending++;
        }
        return acc;
      }, {});

      const chartData = Object.values(grouped).map(item => ({
        date: item.date,
        completed: item.completed,
        pending: item.pending,
        total: item.total
      }));

      setTaskData(chartData);
    }
  };

  const fetchMeetingAttendanceData = async (userId) => {
    const { data, error } = await supabase
      .from('meetings')
      .select('start_time, attendees_count, duration_minutes')
      .eq('user_id', userId)
      .gte('start_time', getDateRange(timeRange));

    if (!error && data) {
      const chartData = data.map(meeting => ({
        date: new Date(meeting.start_time).toLocaleDateString(),
        attendees: meeting.attendees_count || 1,
        duration: meeting.duration_minutes || 30,
        efficiency: Math.round(((meeting.attendees_count || 1) * (meeting.duration_minutes || 30)) / 100)
      }));
      setMeetingData(chartData);
    }
  };

  const fetchExpenseTrends = async (userId) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('created_at, amount, category')
      .eq('user_id', userId)
      .gte('created_at', getDateRange(timeRange));

    if (!error && data) {
      // Group by date
      const grouped = data.reduce((acc, expense) => {
        const date = new Date(expense.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, amount: 0 };
        }
        acc[date].amount += expense.amount || 0;
        return acc;
      }, {});

      const chartData = Object.values(grouped).map(item => ({
        date: item.date,
        amount: Math.round(item.amount)
      }));

      setExpenseData(chartData);
    }
  };

  const fetchTeamPerformance = async (userId) => {
    // Assuming you have a teams table
    const { data, error } = await supabase
      .from('team_members')
      .select('user_id, name, tasks_completed, total_tasks')
      .eq('team_leader_id', userId);

    if (!error && data) {
      const performanceData = data.map(member => ({
        name: member.name || 'Team Member',
        efficiency: member.total_tasks > 0 
          ? Math.round((member.tasks_completed / member.total_tasks) * 100)
          : 0,
        tasks: member.tasks_completed || 0
      }));
      setTeamPerformance(performanceData);
      setMetrics(prev => ({ ...prev, teamMembers: data.length }));
    }
  };

  const fetchRecentActivity = async (userId) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentActivity(data);
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    switch (range) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
      default:
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
    }
  };

  const exportData = async () => {
    const user = await getCurrentUser();
    
    // Fetch all data for export
    const [tasks, meetings, expenses] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('meetings').select('*').eq('user_id', user.id),
      supabase.from('expenses').select('*').eq('user_id', user.id)
    ]);

    const data = {
      metrics,
      tasks: tasks.data || [],
      meetings: meetings.data || [],
      expenses: expenses.data || [],
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisuru-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your productivity and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchAnalyticsData}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Productivity Score</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.productivityScore}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                style={{ width: `${metrics.productivityScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.completedTasks}</p>
              <p className="text-sm text-gray-500">of {metrics.totalTasks} total</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Task Time</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.avgTaskCompletionTime}h</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900">${metrics.totalExpenses.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Task Completion Trend</h3>
              <p className="text-sm text-gray-600">Tasks completed over time</p>
            </div>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                  name="Completed Tasks"
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.2}
                  name="Pending Tasks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
              <p className="text-sm text-gray-600">Spending by category</p>
            </div>
            <PieChart className="w-6 h-6 text-purple-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.category}: $${entry.amount}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meeting Efficiency */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Meeting Efficiency</h3>
              <p className="text-sm text-gray-600">Duration vs Attendees</p>
            </div>
            <Users className="w-6 h-6 text-green-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meetingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendees" fill="#10b981" name="Attendees" />
                <Bar dataKey="duration" fill="#3b82f6" name="Duration (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
              <p className="text-sm text-gray-600">Task completion efficiency</p>
            </div>
            <TrendingUp className="w-6 h-6 text-orange-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#8b5cf6" name="Efficiency %" />
                <Bar dataKey="tasks" fill="#f59e0b" name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Latest updates from your workspace</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-50 mr-4">
                      {activity.type === 'task' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'meeting' && <Calendar className="w-5 h-5 text-green-600" />}
                      {activity.type === 'expense' && <DollarSign className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent activity to display
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
            <p className="text-gray-700">
              Your productivity score of <span className="font-semibold">{metrics.productivityScore}%</span> is above average
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
            <p className="text-gray-700">
              You completed <span className="font-semibold">{metrics.completedTasks} tasks</span> with an average time of <span className="font-semibold">{metrics.avgTaskCompletionTime} hours</span>
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-purple-500 mr-3"></div>
            <p className="text-gray-700">
              Consider optimizing meeting durations to improve efficiency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}