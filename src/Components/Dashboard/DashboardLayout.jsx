// src/components/Dashboard/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  BarChart, 
  Users, 
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight,
  Sparkles,
  Mail,
  FileText,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Database,
  Home,
  Shield,
  Globe,
  Cpu,
  Target,
  PieChart,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Award,
  HelpCircle,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [stats, setStats] = useState({
    tasks: 0,
    meetings: 0,
    expenses: 0,
    team: 0,
    projects: 0,
    emails: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Complete list of all HiSuru services in the sidebar
  const dashboardNavItems = [
    {
      category: 'Core Services',
      items: [
        { 
          name: 'Dashboard', 
          path: '/dashboard', 
          icon: <LayoutDashboard className="w-5 h-5" />,
          color: 'blue',
          badge: null
        },
        { 
          name: 'Task Management', 
          path: '/dashboard/tasks', 
          icon: <CheckSquare className="w-5 h-5" />,
          color: 'green',
          badge: stats.tasks > 0 ? `${stats.tasks}` : null
        },
        { 
          name: 'Meeting Scheduler', 
          path: '/dashboard/meetings', 
          icon: <Calendar className="w-5 h-5" />,
          color: 'purple',
          badge: stats.meetings > 0 ? `${stats.meetings}` : null
        },
        { 
          name: 'Email Integration', 
          path: '/dashboard/email', 
          icon: <Mail className="w-5 h-5" />,
          color: 'orange',
          badge: stats.emails > 0 ? `${stats.emails}` : null
        },
        { 
          name: 'Expense Management', 
          path: '/dashboard/expenses', 
          icon: <Wallet className="w-5 h-5" />,
          color: 'red',
          badge: stats.expenses > 0 ? `${stats.expenses}` : null
        },
      ]
    },
    {
      category: 'Advanced Features',
      items: [
        { 
          name: 'Project Management', 
          path: '/dashboard/projects', 
          icon: <BarChart className="w-5 h-5" />,
          color: 'indigo',
          badge: stats.projects > 0 ? `${stats.projects}` : null
        },
        { 
          name: 'Team Collaboration', 
          path: '/dashboard/team', 
          icon: <Users className="w-5 h-5" />,
          color: 'pink',
          badge: stats.team > 0 ? `${stats.team}` : null
        },
        { 
          name: 'Real-time Sync', 
          path: '/dashboard/sync', 
          icon: <RefreshCw className="w-5 h-5" />,
          color: 'cyan',
          badge: 'Live'
        },
        { 
          name: 'AI Intelligence', 
          path: '/dashboard/ai', 
          icon: <Sparkles className="w-5 h-5" />,
          color: 'yellow',
          badge: 'New'
        },
      ]
    },
    {
      category: 'Analytics & Tools',
      items: [
        { 
          name: 'Performance Analytics', 
          path: '/dashboard/analytics', 
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'teal',
          badge: null
        },
        { 
          name: 'Reports & Insights', 
          path: '/dashboard/reports', 
          icon: <FileText className="w-5 h-5" />,
          color: 'amber',
          badge: null
        },
        { 
          name: 'Time Tracking', 
          path: '/dashboard/time', 
          icon: <Clock className="w-5 h-5" />,
          color: 'violet',
          badge: null
        },
        { 
          name: 'Goal Setting', 
          path: '/dashboard/goals', 
          icon: <Target className="w-5 h-5" />,
          color: 'rose',
          badge: null
        },
      ]
    },
    {
      category: 'System',
      items: [
        { 
          name: 'Settings', 
          path: '/dashboard/settings', 
          icon: <Settings className="w-5 h-5" />,
          color: 'gray',
          badge: null
        },
        { 
          name: 'Help & Support', 
          path: '/dashboard/help', 
          icon: <HelpCircle className="w-5 h-5" />,
          color: 'blue',
          badge: null
        },
        { 
          name: 'Security', 
          path: '/dashboard/security', 
          icon: <Shield className="w-5 h-5" />,
          color: 'green',
          badge: null
        },
        { 
          name: 'Integrations', 
          path: '/dashboard/integrations', 
          icon: <Globe className="w-5 h-5" />,
          color: 'purple',
          badge: null
        },
      ]
    }
  ];

  // Fetch user and data on mount
  useEffect(() => {
    fetchUser();
    fetchStats();
    fetchNotifications();
    
    // Set up real-time subscriptions
    const subscriptions = setupRealtimeSubscriptions();
    
    // Load dark mode preference
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const setupRealtimeSubscriptions = () => {
    const subscriptions = [];
    
    // Subscribe to tasks changes
    const tasksSub = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' }, 
        () => fetchStats()
      )
      .subscribe();
    subscriptions.push(tasksSub);

    // Subscribe to meetings changes
    const meetingsSub = supabase
      .channel('meetings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meetings' }, 
        () => fetchStats()
      )
      .subscribe();
    subscriptions.push(meetingsSub);

    // Subscribe to notifications
    const notificationsSub = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        () => fetchNotifications()
      )
      .subscribe();
    subscriptions.push(notificationsSub);

    return subscriptions;
  };

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch counts from all tables
      const [
        tasksCount,
        meetingsCount,
        expensesCount,
        teamCount,
        projectsCount,
        emailsCount
      ] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('expenses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('emails').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      setStats({
        tasks: tasksCount.count || 0,
        meetings: meetingsCount.count || 0,
        expenses: expensesCount.count || 0,
        team: teamCount.count || 0,
        projects: projectsCount.count || 0,
        emails: emailsCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      setNotifications(data || []);
      setUnreadNotifications(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getUserInitial = () => {
    return user?.user_metadata?.full_name?.[0]?.toUpperCase() || 
           user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getPlanColor = () => {
    const plan = user?.user_metadata?.plan || 'free';
    switch(plan.toLowerCase()) {
      case 'pro': return 'from-purple-500 to-pink-600';
      case 'enterprise': return 'from-gray-700 to-gray-900';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-200 ease-in-out lg:translate-x-0 ${
        darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Section */}
        <div className={`flex items-center justify-between h-16 px-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HiSuru
              </h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">Dashboard</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getPlanColor()} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
              {getUserInitial()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs truncate text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
              <div className="flex items-center mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user?.user_metadata?.plan || 'Free'} Plan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {dashboardNavItems.map((section) => (
            <div key={section.category} className="mb-6">
              <h3 className={`px-4 text-xs font-semibold uppercase tracking-wider mb-3 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {section.category}
              </h3>
              <div className="space-y-1 px-2">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                      isActive(item.path)
                        ? darkMode 
                          ? 'bg-blue-900/20 text-blue-300 border-l-4 border-blue-500' 
                          : 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className={`mr-3 p-1.5 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700/50 group-hover:bg-gray-600/50' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive(item.path) && (
                      <ChevronRight className="ml-2 w-4 h-4 opacity-60" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-2">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center justify-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className={`flex items-center justify-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'text-red-400 hover:bg-red-900/20' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Navigation Bar */}
        <header className={`sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b shadow-sm ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center text-sm">
              <Link 
                to="/dashboard" 
                className={`hover:underline ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Dashboard
              </Link>
              <ChevronRight className={`w-4 h-4 mx-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {location.pathname.split('/').pop() || 'Home'}
              </span>
            </div>

            {/* Search Bar */}
            <div className={`flex-1 max-w-xl ml-4 ${showSearch ? 'block' : 'hidden md:block'}`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="search"
                  placeholder="Search across all services..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </button>
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative`}
                onClick={markAllNotificationsAsRead}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </div>

            {/* Quick Stats Badge */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
              }`}>
                {stats.tasks} Tasks
              </div>
              <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}>
                {stats.meetings} Meetings
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button className={`flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}>
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getPlanColor()} flex items-center justify-center text-white text-sm font-bold`}>
                  {getUserInitial()}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-6">
          <Outlet context={{ darkMode, user, stats, fetchStats }} />
        </main>

        {/* Bottom Navigation (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-around items-center h-16">
            {dashboardNavItems[0].items.slice(0, 4).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 ${
                  isActive(item.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name.split(' ')[0]}</span>
              </Link>
            ))}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center p-2 text-gray-600 dark:text-gray-400"
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs mt-1">More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}