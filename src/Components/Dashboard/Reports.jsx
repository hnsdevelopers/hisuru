import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Download,
  Filter,
  RefreshCw,
  Activity,
  PieChart,
  Target,
  Award,
  ChevronDown,
  Eye,
  FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    key: 'selection'
  });
  const [selectedView, setSelectedView] = useState('overview'); // overview, tasks, meetings, expenses
  
  // State for report data
  const [reportData, setReportData] = useState({
    overview: {},
    tasks: {},
    meetings: {},
    expenses: {},
    performance: {}
  });

  // State for raw data
  const [rawTasks, setRawTasks] = useState([]);
  const [rawMeetings, setRawMeetings] = useState([]);
  const [rawExpenses, setRawExpenses] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  // Fetch data from database
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];

      // Fetch tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${startDate}T00:00:00Z`)
        .lte('created_at', `${endDate}T23:59:59Z`)
        .order('created_at', { ascending: false });

      // Fetch meetings
      const { data: meetings } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', `${startDate}T00:00:00Z`)
        .lte('start_time', `${endDate}T23:59:59Z`)
        .order('start_time', { ascending: false });

      // Fetch expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      // Fetch performance metrics
      const { data: performance } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      // Process and calculate metrics
      const overview = calculateOverviewMetrics(tasks, meetings, expenses);
      const taskAnalysis = analyzeTasks(tasks);
      const meetingAnalysis = analyzeMeetings(meetings);
      const expenseAnalysis = analyzeExpenses(expenses);

      setReportData({
        overview,
        tasks: taskAnalysis,
        meetings: meetingAnalysis,
        expenses: expenseAnalysis,
        performance: performance || []
      });

      setRawTasks(tasks || []);
      setRawMeetings(meetings || []);
      setRawExpenses(expenses || []);
      setPerformanceData(performance || []);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overview metrics
  const calculateOverviewMetrics = (tasks, meetings, expenses) => {
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
    const totalTasks = tasks?.length || 0;
    const totalMeetings = meetings?.length || 0;
    const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
    
    // Calculate meeting hours
    const meetingHours = meetings?.reduce((hours, meeting) => {
      const start = new Date(meeting.start_time);
      const end = new Date(meeting.end_time);
      const duration = (end - start) / (1000 * 60 * 60); // hours
      return hours + duration;
    }, 0) || 0;

    // Calculate productivity score
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const avgMeetingDuration = totalMeetings > 0 ? meetingHours / totalMeetings : 0;
    
    const productivityScore = Math.min(
      100,
      (taskCompletionRate * 0.6) + // 60% weight to task completion
      ((1 / (avgMeetingDuration + 1)) * 100 * 0.3) + // 30% weight to efficient meetings
      10 // base score
    );

    return {
      completedTasks,
      totalTasks,
      taskCompletionRate: parseFloat(taskCompletionRate.toFixed(1)),
      totalMeetings,
      meetingHours: parseFloat(meetingHours.toFixed(1)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      productivityScore: parseFloat(productivityScore.toFixed(1)),
      upcomingMeetings: meetings?.filter(m => new Date(m.start_time) > new Date()).length || 0,
      pendingTasks: tasks?.filter(t => t.status !== 'completed').length || 0
    };
  };

  // Analyze tasks data
  const analyzeTasks = (tasks) => {
    if (!tasks || tasks.length === 0) return {};
    
    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    const byCategory = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Calculate average completion time
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completed_at);
    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const created = new Date(task.created_at);
          const completed = new Date(task.completed_at);
          return sum + (completed - created) / (1000 * 60 * 60 * 24); // days
        }, 0) / completedTasks.length
      : 0;

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      byCategory,
      avgCompletionTime: parseFloat(avgCompletionTime.toFixed(1)),
      overdueTasks: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
    };
  };

  // Analyze meetings data
  const analyzeMeetings = (meetings) => {
    if (!meetings || meetings.length === 0) return {};
    
    const byType = meetings.reduce((acc, meeting) => {
      const type = meeting.meeting_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const byPlatform = meetings.reduce((acc, meeting) => {
      const platform = meeting.platform || 'Other';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    const byStatus = meetings.reduce((acc, meeting) => {
      acc[meeting.status] = (acc[meeting.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate average meeting duration
    const avgDuration = meetings.reduce((sum, meeting) => {
      const start = new Date(meeting.start_time);
      const end = new Date(meeting.end_time);
      return sum + (end - start) / (1000 * 60); // minutes
    }, 0) / meetings.length;

    return {
      total: meetings.length,
      byType,
      byPlatform,
      byStatus,
      avgDuration: parseFloat(avgDuration.toFixed(0)),
      upcoming: meetings.filter(m => new Date(m.start_time) > new Date()).length
    };
  };

  // Analyze expenses data
  const analyzeExpenses = (expenses) => {
    if (!expenses || expenses.length === 0) return {};
    
    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

    const byStatus = expenses.reduce((acc, expense) => {
      acc[expense.status] = (acc[expense.status] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

    const byMonth = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const avgExpense = total / expenses.length;

    return {
      total: parseFloat(total.toFixed(2)),
      byCategory,
      byStatus,
      byMonth,
      avgExpense: parseFloat(avgExpense.toFixed(2)),
      count: expenses.length,
      pendingAmount: expenses
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0)
    };
  };

  // Export report as CSV
  const exportReport = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    switch (type) {
      case 'tasks':
        csvContent += "ID,Title,Status,Priority,Due Date,Category\n";
        rawTasks.forEach(task => {
          csvContent += `${task.id},${task.title},${task.status},${task.priority},${task.due_date},${task.category}\n`;
        });
        break;
      case 'meetings':
        csvContent += "ID,Title,Start Time,End Time,Type,Status,Platform\n";
        rawMeetings.forEach(meeting => {
          csvContent += `${meeting.id},${meeting.title},${meeting.start_time},${meeting.end_time},${meeting.meeting_type},${meeting.status},${meeting.platform}\n`;
        });
        break;
      case 'expenses':
        csvContent += "ID,Description,Amount,Category,Date,Status,Vendor\n";
        rawExpenses.forEach(expense => {
          csvContent += `${expense.id},${expense.description},${expense.amount},${expense.category},${expense.date},${expense.status},${expense.vendor}\n`;
        });
        break;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track your productivity and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
          </div>
          <button
            onClick={fetchReportData}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Date Range</h3>
          <span className="text-sm text-gray-500">
            {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </span>
        </div>
        <DateRangePicker
          ranges={[dateRange]}
          onChange={ranges => setDateRange(ranges.selection)}
          moveRangeOnFirstSelection={false}
          className="w-full"
        />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600">
              +{reportData.overview.taskCompletionRate || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {reportData.overview.completedTasks || 0}/{reportData.overview.totalTasks || 0}
          </h3>
          <p className="text-gray-600">Tasks Completed</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${reportData.overview.taskCompletionRate || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">
              {reportData.meetings.avgDuration || 0}min avg
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {reportData.overview.totalMeetings || 0}
          </h3>
          <p className="text-gray-600">Total Meetings</p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {reportData.overview.upcomingMeetings || 0} upcoming
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-red-600">
              ${reportData.expenses.pendingAmount?.toFixed(2) || '0.00'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ${reportData.overview.totalExpenses?.toFixed(2) || '0.00'}
          </h3>
          <p className="text-gray-600">Total Expenses</p>
          <div className="mt-4 text-sm text-gray-500">
            {reportData.expenses.count || 0} transactions
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-sm font-medium ${
              (reportData.overview.productivityScore || 0) > 70 ? 'text-green-600' : 
              (reportData.overview.productivityScore || 0) > 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {reportData.overview.productivityScore || 0}/100
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Productivity Score
          </h3>
          <p className="text-gray-600">Overall Performance</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${reportData.overview.productivityScore || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Report */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Tasks Analysis</h3>
            </div>
            <button
              onClick={() => exportReport('tasks')}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          
          {reportData.tasks.total > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 mb-1">By Status</div>
                  {Object.entries(reportData.tasks.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-700 mb-1">By Priority</div>
                  {Object.entries(reportData.tasks.byPriority || {}).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{priority}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Average Completion Time</span>
                  <span className="font-medium">{reportData.tasks.avgCompletionTime || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Overdue Tasks</span>
                  <span className="font-medium text-red-600">{reportData.tasks.overdueTasks || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No task data available for selected period</p>
            </div>
          )}
        </div>

        {/* Meetings Report */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Meetings Analysis</h3>
            </div>
            <button
              onClick={() => exportReport('meetings')}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          
          {reportData.meetings.total > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">By Type</div>
                  {Object.entries(reportData.meetings.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-700 mb-1">By Platform</div>
                  {Object.entries(reportData.meetings.byPlatform || {}).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{platform}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Average Duration</span>
                  <span className="font-medium">{reportData.meetings.avgDuration || 0} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Upcoming Meetings</span>
                  <span className="font-medium text-blue-600">{reportData.meetings.upcoming || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No meeting data available for selected period</p>
            </div>
          )}
        </div>

        {/* Expenses Report */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Expenses Analysis</h3>
            </div>
            <button
              onClick={() => exportReport('expenses')}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          
          {reportData.expenses.count > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-700 mb-2">By Category</div>
                  {Object.entries(reportData.expenses.byCategory || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700 capitalize">{category}</span>
                        <span className="font-medium">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 mb-2">By Status</div>
                  {Object.entries(reportData.expenses.byStatus || {}).map(([status, amount]) => (
                    <div key={status} className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-700 capitalize">{status}</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-700 mb-2">Monthly Trend</div>
                  {Object.entries(reportData.expenses.byMonth || {})
                    .sort(([a], [b]) => new Date(`2024 ${a}`) - new Date(`2024 ${b}`))
                    .map(([month, amount]) => (
                      <div key={month} className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700">{month}</span>
                        <span className="font-medium">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Expenses</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${reportData.expenses.total?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Average Expense</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${reportData.expenses.avgExpense?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Transactions</div>
                    <div className="text-lg font-bold text-gray-900">
                      {reportData.expenses.count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Pending Amount</div>
                    <div className="text-lg font-bold text-red-600">
                      ${reportData.expenses.pendingAmount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No expense data available for selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Performance Trends</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`px-3 py-1 rounded-full text-sm ${selectedView === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setSelectedView('overview')}>
              Overview
            </button>
            <button className={`px-3 py-1 rounded-full text-sm ${selectedView === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setSelectedView('tasks')}>
              Tasks
            </button>
            <button className={`px-3 py-1 rounded-full text-sm ${selectedView === 'meetings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setSelectedView('meetings')}>
              Meetings
            </button>
          </div>
        </div>

        {performanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Completed Tasks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Tasks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Meeting Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Expenses</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Productivity</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.slice(0, 10).map((day, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="font-medium">{day.completed_tasks || 0}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {day.total_tasks || 0}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="font-medium">{day.meeting_hours?.toFixed(1) || 0}</span> hrs
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="font-medium">${day.expense_total?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${day.productivity_score || 0}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${
                          (day.productivity_score || 0) > 70 ? 'text-green-600' : 
                          (day.productivity_score || 0) > 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {day.productivity_score?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No performance data available yet</p>
            <p className="text-sm text-gray-400 mt-1">Data will appear as you use the platform</p>
          </div>
        )}
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
        <div className="flex items-center mb-4">
          <Award className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Insights & Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          {reportData.tasks.overdueTasks > 0 && (
            <div className="flex items-start p-4 bg-white rounded-lg border border-orange-200">
              <div className="p-2 rounded-lg bg-orange-100 mr-3">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Overdue Tasks Alert</h4>
                <p className="text-sm text-gray-600">
                  You have {reportData.tasks.overdueTasks} overdue tasks. Consider rescheduling or prioritizing them.
                </p>
              </div>
            </div>
          )}
          
          {reportData.expenses.pendingAmount > 0 && (
            <div className="flex items-start p-4 bg-white rounded-lg border border-red-200">
              <div className="p-2 rounded-lg bg-red-100 mr-3">
                <DollarSign className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Pending Expenses</h4>
                <p className="text-sm text-gray-600">
                  You have ${reportData.expenses.pendingAmount.toFixed(2)} in pending expenses. Review and process them soon.
                </p>
              </div>
            </div>
          )}
          
          {reportData.meetings.avgDuration > 60 && (
            <div className="flex items-start p-4 bg-white rounded-lg border border-purple-200">
              <div className="p-2 rounded-lg bg-purple-100 mr-3">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Meeting Efficiency</h4>
                <p className="text-sm text-gray-600">
                  Your average meeting duration is {reportData.meetings.avgDuration} minutes. Consider shorter, more focused meetings.
                </p>
              </div>
            </div>
          )}
          
          {reportData.overview.productivityScore < 60 && (
            <div className="flex items-start p-4 bg-white rounded-lg border border-blue-200">
              <div className="p-2 rounded-lg bg-blue-100 mr-3">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Productivity Boost</h4>
                <p className="text-sm text-gray-600">
                  Your productivity score is {reportData.overview.productivityScore}. Try using the Pomodoro technique to improve focus.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}