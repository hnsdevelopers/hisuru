import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  User, 
  LogOut, 
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Wallet,
  Users,
  BarChart,
  Settings,
  Bell,
  Search,
  Home,
  DollarSign,
  Phone
} from "lucide-react";
import { supabase } from "../lib/supabase"; // Adjust path as needed

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Visitor navigation items (when NOT logged in)
  const visitorNavItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Services", path: "/services", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Pricing", path: "/pricing", icon: <DollarSign className="w-4 h-4" /> },
    { name: "Contact", path: "/contact", icon: <Phone className="w-4 h-4" /> },
  ];

  // Dashboard navigation items (for top navbar when logged in)
  const dashboardNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Tasks", path: "/dashboard/tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { name: "Meetings", path: "/dashboard/meetings", icon: <Calendar className="w-5 h-5" /> },
    { name: "Projects", path: "/dashboard/projects", icon: <BarChart className="w-5 h-5" /> },
    { name: "Team", path: "/dashboard/team", icon: <Users className="w-5 h-5" /> },
  ];

  // Dashboard sidebar items (for mobile menu when logged in)
  const dashboardSidebarItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Tasks", path: "/dashboard/tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { name: "Meetings", path: "/dashboard/meetings", icon: <Calendar className="w-5 h-5" /> },
    { name: "Expenses", path: "/dashboard/expenses", icon: <Wallet className="w-5 h-5" /> },
    { name: "Projects", path: "/dashboard/projects", icon: <BarChart className="w-5 h-5" /> },
    { name: "Team", path: "/dashboard/team", icon: <Users className="w-5 h-5" /> },
    { name: "Analytics", path: "/dashboard/analytics", icon: <BarChart className="w-5 h-5" /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  // Get current user on mount and auth changes
  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      setIsOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  if (loading) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-white shadow-md">
          <div className="h-full px-4 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HiSuru
              </span>
            </div>
          </div>
        </nav>
        <div className="h-12"></div>
      </>
    );
  }

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-12 transition-all duration-200 ${
        scrolled || user
          ? 'bg-white shadow-md border-b border-gray-100' 
          : 'bg-white'
      }`}>
        <div className="h-full px-4">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link 
              to={user ? "/dashboard" : "/"} 
              className="flex items-center space-x-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HiSuru
              </span>
              {!user && (
                <span className="text-xs font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                  AI
                </span>
              )}
            </Link>

            {/* Desktop Navigation - Conditionally rendered */}
            <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 h-full">
              {user ? (
                // LOGGED IN - Dashboard navigation
                dashboardNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center h-full px-4 mx-1 text-sm font-medium transition-colors relative group ${
                      isActive(item.path)
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                    {isActive(item.path) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></span>
                    )}
                  </Link>
                ))
              ) : (
                // NOT LOGGED IN - Visitor navigation
                visitorNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center h-full px-4 mx-1 text-sm font-medium transition-colors relative ${
                      isActive(item.path)
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></span>
                    )}
                  </Link>
                ))
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {user ? (
                // LOGGED IN - User actions
                <>
                  {/* Search (desktop) */}
                  <div className="hidden md:flex items-center relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Notifications */}
                  <button className="hidden md:block p-1.5 rounded-lg hover:bg-gray-100">
                    <Bell className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* User Profile */}
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || "User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.user_metadata?.plan || "Free Plan"}
                      </span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="hidden md:flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                // NOT LOGGED IN - Auth buttons
                <>
                  <Link
                    to="/login"
                    className="hidden sm:block text-sm font-medium text-gray-700 hover:text-blue-600 px-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login?mode=signup"
                    className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200 active:scale-95"
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden ml-2 p-1.5 rounded hover:bg-gray-100"
              >
                {isOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-12 left-0 right-0 bg-white shadow-lg border-t border-gray-100 animate-slideDown max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3">
              {user ? (
                // LOGGED IN - Dashboard mobile menu
                <>
                  {/* User Profile */}
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mr-3">
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user.email}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          {user.user_metadata?.plan || "Free Plan"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search (mobile) */}
                  <div className="mb-4 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search dashboard..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Dashboard Navigation Links */}
                  <div className="space-y-1">
                    {dashboardSidebarItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          {item.name}
                        </div>
                        {isActive(item.path) ? (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-3 border-t border-gray-100"></div>

                  {/* Additional Options */}
                  <div className="space-y-1">
                    <button className="flex items-center justify-between w-full p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 mr-3 text-gray-500" />
                        Notifications
                      </div>
                      <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">3</span>
                    </button>
                    
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-3 text-gray-500" />
                        Account Settings
                      </div>
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center w-full p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                // NOT LOGGED IN - Visitor mobile menu
                <>
                  {/* Welcome Message */}
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">HiSuru AI Platform</p>
                        <p className="text-xs text-gray-600">Start free trial today</p>
                      </div>
                    </div>
                  </div>

                  {/* Visitor Navigation Links */}
                  <div className="space-y-1">
                    {visitorNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          {item.name}
                        </div>
                        {isActive(item.path) && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-3 border-t border-gray-100"></div>

                  {/* Additional Links */}
                  <div className="space-y-1">
                    <Link
                      to="/features"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-3 text-purple-500" />
                        AI Features
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                    
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-3 text-gray-500" />
                        Sign In to Account
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>

                  {/* Mobile CTA */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                    <p className="text-sm font-semibold text-white mb-2">Ready to boost productivity?</p>
                    <Link
                      to="/login?mode=signup"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-12"></div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}