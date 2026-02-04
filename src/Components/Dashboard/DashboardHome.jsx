import { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Calendar,
  Circle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Sparkles,
  Plus,
  MoreVertical,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useOutletContext } from "react-router-dom";

export default function DashboardHome() {
  const { darkMode, user } = useOutletContext();
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    upcomingMeetings: 0,
    totalExpenses: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    fetchDashboardData();

    // Real-time subscriptions for live updates
    const tasksSubscription = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          fetchRecentTasks();
          fetchStats();
        },
      )
      .subscribe();

    const meetingsSubscription = supabase
      .channel("meetings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        () => {
          fetchUpcomingMeetings();
          fetchStats();
        },
      )
      .subscribe();

    const expensesSubscription = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          fetchRecentExpenses();
          fetchStats();
        },
      )
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      meetingsSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchRecentTasks(),
        fetchUpcomingMeetings(),
        fetchRecentExpenses(),
        fetchTeamMembers(),
        fetchStats(),
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setRecentTasks([]);
    }
  };

  const fetchUpcomingMeetings = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user?.id)
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingMeetings(data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setUpcomingMeetings([]);
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setRecentExpenses([]);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Assuming you have a team_members table or users table for team
      // If not, we can use a placeholder or create one
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name")
        .neq("id", user?.id)
        .limit(4);

      if (error) {
        // If no team_members table, show placeholder
        setTeamMembers([
          { id: 1, full_name: "Team Member 1", email: "member1@example.com" },
          { id: 2, full_name: "Team Member 2", email: "member2@example.com" },
        ]);
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembers([]);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        { count: totalTasks, error: tasksError },
        { count: completedTasks, error: completedError },
        { count: pendingTasks, error: pendingError },
        { count: upcomingMeetings, error: meetingsError },
        { data: expensesData, error: expensesError },
      ] = await Promise.all([
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user?.id),

        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user?.id)
          .eq("status", "completed"),

        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user?.id)
          .eq("status", "pending"),

        supabase
          .from("meetings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user?.id)
          .gte("scheduled_at", new Date().toISOString()),

        supabase.from("expenses").select("amount").eq("user_id", user?.id),
      ]);

      // Calculate total expenses
      const totalExpenses =
        expensesData?.reduce((sum, expense) => {
          return sum + parseFloat(expense.amount || 0);
        }, 0) || 0;

      // Calculate productivity score based on task completion
      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate estimated time saved (logic based on your business)
      // For now, let's calculate based on completed tasks
      const timeSaved = completedTasks * 2; // Assuming 2 hours saved per completed task

      setStats({
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        pendingTasks: pendingTasks || 0,
        upcomingMeetings: upcomingMeetings || 0,
        totalExpenses,
        teamMembers: teamMembers.length || 0,
        completionRate,
        timeSaved,
        revenue: totalExpenses * 0.1, // Example: 10% of expenses as revenue
        productivity: completionRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const toggleTask = (taskId) => {
    setRecentTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleToggleComplete = async (task) => {
  if (!task?.id) {
    console.error('Task ID is missing:', task);
    return;
  }

  const previousStatus = task.status;
  const newStatus = previousStatus === 'completed' ? 'pending' : 'completed';

  // Optimistic UI update
  setTasks((prevTasks) =>
    prevTasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t
    )
  );

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating task:', err);

    // Rollback if update fails
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, status: previousStatus } : t
      )
    );
  }
};


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: darkMode
        ? "bg-red-900/30 text-red-300"
        : "bg-red-100 text-red-600",
      high: darkMode
        ? "bg-orange-900/30 text-orange-300"
        : "bg-orange-100 text-orange-600",
      medium: darkMode
        ? "bg-yellow-900/30 text-yellow-300"
        : "bg-yellow-100 text-yellow-600",
      low: darkMode
        ? "bg-blue-900/30 text-blue-300"
        : "bg-blue-100 text-blue-600",
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: darkMode
        ? "bg-blue-900/30 text-blue-300"
        : "bg-blue-100 text-blue-600",
      completed: darkMode
        ? "bg-green-900/30 text-green-300"
        : "bg-green-100 text-green-600",
      cancelled: darkMode
        ? "bg-gray-900/30 text-gray-300"
        : "bg-gray-100 text-gray-600",
      pending: darkMode
        ? "bg-yellow-900/30 text-yellow-300"
        : "bg-yellow-100 text-yellow-600",
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getExpenseCategoryColor = (category) => {
    const colors = {
      travel: darkMode
        ? "bg-blue-900/30 text-blue-300"
        : "bg-blue-100 text-blue-600",
      food: darkMode
        ? "bg-green-900/30 text-green-300"
        : "bg-green-100 text-green-600",
      equipment: darkMode
        ? "bg-purple-900/30 text-purple-300"
        : "bg-purple-100 text-purple-600",
      software: darkMode
        ? "bg-indigo-900/30 text-indigo-300"
        : "bg-indigo-100 text-indigo-600",
      other: darkMode
        ? "bg-gray-900/30 text-gray-300"
        : "bg-gray-100 text-gray-600",
    };
    return colors[category?.toLowerCase()] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className={`rounded-2xl p-6 ${
          darkMode
            ? "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700"
            : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome back,{" "}
              {user?.user_metadata?.full_name?.split(" ")[0] ||
                user?.email?.split("@")[0] ||
                "User"}
              ! 👋
            </h1>
            <p
              className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={() =>
                (window.location.href = "/dashboard/tasks?new=true")
              }
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Productivity Score */}
        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 hover:border-gray-300"
          } transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Completion Rate
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {stats.completionRate}%
              </p>
              <p
                className={`text-xs mt-1 ${
                  darkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                {stats.completedTasks} of {stats.totalTasks} tasks
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                darkMode
                  ? "bg-emerald-900/30 text-emerald-400"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Time Saved */}
        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 hover:border-gray-300"
          } transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Time Saved
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {stats.timeSaved}h
              </p>
              <p
                className={`text-xs mt-1 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                This week
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                darkMode
                  ? "bg-blue-900/30 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 hover:border-gray-300"
          } transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Upcoming Meetings
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {stats.upcomingMeetings}
              </p>
              <p
                className={`text-xs mt-1 ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Next:{" "}
                {upcomingMeetings[0]
                  ? formatTime(upcomingMeetings[0].scheduled_at)
                  : "None"}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                darkMode
                  ? "bg-purple-900/30 text-purple-400"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 hover:border-gray-300"
          } transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Expenses
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(stats.totalExpenses)}
              </p>
              <p
                className={`text-xs mt-1 ${
                  darkMode ? "text-orange-400" : "text-orange-600"
                }`}
              >
                {recentExpenses.length} entries
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                darkMode
                  ? "bg-orange-900/30 text-orange-400"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div
          className={`rounded-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`font-semibold flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Recent Tasks
              </h3>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {stats.totalTasks} total
              </span>
            </div>
          </div>
          <div className="p-6">
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {/* <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className={`w-4 h-4 rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'border-gray-300'
                        }`}
                      /> */}
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="flex items-center justify-center w-5 h-5"
                        aria-label="Toggle task completion"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle
                            className={`w-5 h-5 ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                        )}
                      </button>

                      <div className="ml-3 flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center mt-1 space-x-3">
                          {task.due_date && (
                            <p
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Due {formatDate(task.due_date)}
                            </p>
                          )}
                          {task.priority && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`ml-2 p-1 rounded ${
                        darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle
                  className={`w-12 h-12 mx-auto mb-4 ${
                    darkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                />
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  No tasks yet. Create your first task!
                </p>
                <button
                  className={`mt-4 px-4 py-2 rounded-lg font-medium ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={() =>
                    (window.location.href = "/dashboard/tasks?new=true")
                  }
                >
                  Create Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div
          className={`rounded-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`font-semibold flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Upcoming Meetings
              </h3>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {stats.upcomingMeetings} upcoming
              </span>
            </div>
          </div>
          <div className="p-6">
            {upcomingMeetings.length > 0 ? (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-medium truncate ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {meeting.title}
                        </p>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(meeting.status)}`}
                        >
                          {meeting.status}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 space-x-4">
                        <div className="flex items-center">
                          <Clock
                            className={`w-3 h-3 mr-1 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {formatDate(meeting.scheduled_at)}
                          </p>
                        </div>
                        {meeting.duration_minutes && (
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {formatDuration(meeting.duration_minutes)}
                          </p>
                        )}
                        {meeting.meeting_type && (
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {meeting.meeting_type}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      {meeting.meeting_link && (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded ${
                            darkMode
                              ? "bg-blue-900/30 text-blue-300 hover:bg-blue-800/30"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          Join
                        </a>
                      )}
                      <button
                        className={`p-1 rounded ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar
                  className={`w-12 h-12 mx-auto mb-4 ${
                    darkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                />
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  No upcoming meetings scheduled
                </p>
                <button
                  className={`mt-4 px-4 py-2 rounded-lg font-medium ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={() =>
                    (window.location.href = "/dashboard/meetings?new=true")
                  }
                >
                  Schedule Meeting
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div
        className={`rounded-xl mb-[150px]  border ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`px-6 py-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`font-semibold flex items-center ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Recent Expenses
            </h3>
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Total: {formatCurrency(stats.totalExpenses)}
            </span>
          </div>
        </div>
        <div className="p-6">
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-lg mr-3 ${getExpenseCategoryColor(expense.category)}`}
                    >
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {expense.title}
                      </p>
                      <div className="flex items-center mt-1 space-x-3">
                        <span
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {expense.category}
                        </span>
                        {expense.date && (
                          <span
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(parseFloat(expense.amount))}
                    </p>
                    <p
                      className={`text-xs p-2 rounded-md mt-1 ${getStatusColor(expense.status)}`}
                    >
                      {expense.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign
                className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                No expenses recorded yet
              </p>
              <button
                className={`mt-4 px-4 py-2 rounded-lg font-medium ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={() =>
                  (window.location.href = "/dashboard/expenses?new=true")
                }
              >
                Add Expense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
