// src/components/Dashboard/Meetings.jsx
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video, 
  MoreVertical, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Link as LinkIcon,
  Download,
  Upload,
  RefreshCw,
  Grid,
  List,
  X,
  Bell,
  Share2,
  Copy,
  ExternalLink,
  BarChart,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MessageSquare,
  ChevronDown,
  Info,
  AlertCircle,
  UserPlus,
  DownloadCloud,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  CalendarDays
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';

export default function Meetings() {
  const { darkMode, user } = useOutletContext();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateMeetings, setSelectedDateMeetings] = useState([]);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [joiningMeeting, setJoiningMeeting] = useState(null);
  const [showDateDetailModal, setShowDateDetailModal] = useState(false);
  const [selectedDateForDetail, setSelectedDateForDetail] = useState(null);
  const [dateDetailMeetings, setDateDetailMeetings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    today: 0
  });
  
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduled_at: new Date().toISOString().slice(0, 16),
    duration_minutes: 30,
    meeting_type: 'video',
    meeting_link: '',
    location: '',
    participants: [],
    agenda: '',
    status: 'scheduled'
  });

  const meetingTypes = [
    { value: 'video', label: 'Video Call', icon: Video, color: 'blue' },
    { value: 'audio', label: 'Audio Call', icon: Mic, color: 'green' },
    { value: 'in_person', label: 'In Person', icon: MapPin, color: 'purple' },
    { value: 'hybrid', label: 'Hybrid', icon: Users, color: 'orange' }
  ];

  const statuses = [
    { value: 'scheduled', label: 'Scheduled', color: 'blue', icon: CalendarIcon },
    { value: 'in_progress', label: 'In Progress', color: 'yellow', icon: Clock },
    { value: 'completed', label: 'Completed', color: 'green', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'red', icon: XCircle }
  ];

  const durations = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  // Sample participants for demo
  const sampleParticipants = [
    { email: 'alex@example.com', name: 'Alex Johnson', role: 'Designer' },
    { email: 'sarah@example.com', name: 'Sarah Miller', role: 'Developer' },
    { email: 'mike@example.com', name: 'Mike Chen', role: 'Manager' },
    { email: 'lisa@example.com', name: 'Lisa Wang', role: 'Analyst' },
    { email: 'john@example.com', name: 'John Smith', role: 'Client' }
  ];

  // Fetch all meetings on component mount and when date changes
  useEffect(() => {
    fetchAllMeetings();
    
    // Real-time subscription
    const subscription = supabase
      .channel('meetings-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meetings' }, 
        () => {
          fetchAllMeetings();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  // Update selected date meetings when selected date or all meetings change
  useEffect(() => {
    updateSelectedDateMeetings();
  }, [selectedDate, meetings]);

  // Update stats when meetings change
  useEffect(() => {
    updateStats();
  }, [meetings]);

  const fetchAllMeetings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user?.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedDateMeetings = () => {
    if (!selectedDate) return;
    
    const filtered = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduled_at);
      return meetingDate.toDateString() === selectedDate.toDateString();
    });
    
    setSelectedDateMeetings(filtered);
  };

  const updateStats = () => {
    const today = new Date();
    
    const total = meetings.length;
    const scheduled = meetings.filter(m => m.status === 'scheduled').length;
    const inProgress = meetings.filter(m => m.status === 'in_progress').length;
    const completed = meetings.filter(m => m.status === 'completed').length;
    const todayCount = meetings.filter(m => {
      const meetingDate = new Date(m.scheduled_at);
      return meetingDate.toDateString() === today.toDateString();
    }).length;

    setStats({
      total,
      scheduled,
      inProgress,
      completed,
      today: todayCount
    });
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert([{
          user_id: user?.id,
          title: newMeeting.title,
          description: newMeeting.description,
          scheduled_at: newMeeting.scheduled_at,
          duration_minutes: newMeeting.duration_minutes,
          meeting_type: newMeeting.meeting_type,
          meeting_link: newMeeting.meeting_link,
          location: newMeeting.location,
          participants: newMeeting.participants,
          agenda: newMeeting.agenda,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      resetNewMeetingForm();
      setShowNewMeetingModal(false);
      
      // Send notifications to participants
      await sendMeetingInvitations(data);
      
      alert('Meeting created successfully!');
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting: ' + error.message);
    }
  };

  const sendMeetingInvitations = async (meeting) => {
    try {
      // Create notifications for each participant
      const notifications = meeting.participants.map(email => ({
        user_id: user?.id,
        title: 'Meeting Invitation',
        message: `You've been invited to "${meeting.title}" on ${formatDateTime(meeting.scheduled_at)}`,
        type: 'meeting_invite',
        metadata: { meeting_id: meeting.id }
      }));

      // Insert notifications
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending invitations:', error);
    }
  };

  const handleUpdateMeetingStatus = async (meetingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', meetingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating meeting status:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setNewMeeting({
      title: meeting.title,
      description: meeting.description || '',
      scheduled_at: meeting.scheduled_at ? meeting.scheduled_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
      duration_minutes: meeting.duration_minutes || 30,
      meeting_type: meeting.meeting_type || 'video',
      meeting_link: meeting.meeting_link || '',
      location: meeting.location || '',
      participants: meeting.participants || [],
      agenda: meeting.agenda || '',
      status: meeting.status || 'scheduled'
    });
    setShowNewMeetingModal(true);
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          ...newMeeting,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMeeting.id);

      if (error) throw error;

      setShowNewMeetingModal(false);
      setEditingMeeting(null);
      resetNewMeetingForm();
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const resetNewMeetingForm = () => {
    setNewMeeting({
      title: '',
      description: '',
      scheduled_at: new Date().toISOString().slice(0, 16),
      duration_minutes: 30,
      meeting_type: 'video',
      meeting_link: '',
      location: '',
      participants: [],
      agenda: '',
      status: 'scheduled'
    });
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.meeting_link) {
      window.open(meeting.meeting_link, '_blank');
    } else {
      setJoiningMeeting(meeting);
    }
  };

  const copyMeetingLink = (meeting) => {
    const link = meeting.meeting_link || `https://meet.hisuru.com/${meeting.id}`;
    navigator.clipboard.writeText(link);
    alert('Meeting link copied to clipboard!');
  };

  const shareMeeting = (meeting) => {
    const meetingData = {
      title: meeting.title,
      date: formatDateTime(meeting.scheduled_at),
      link: meeting.meeting_link || `https://meet.hisuru.com/${meeting.id}`,
      agenda: meeting.agenda
    };

    if (navigator.share) {
      navigator.share({
        title: meeting.title,
        text: `Meeting: ${meeting.title} on ${formatDateTime(meeting.scheduled_at)}`,
        url: meetingData.link
      });
    } else {
      copyMeetingLink(meeting);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    showDateDetail(today);
  };

  // Show detailed meetings for a date
  const showDateDetail = (date) => {
    const filteredMeetings = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduled_at);
      return meetingDate.toDateString() === date.toDateString();
    });
    
    setSelectedDateForDetail(date);
    setDateDetailMeetings(filteredMeetings);
    setShowDateDetailModal(true);
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month days
    const totalCells = 42;
    const nextMonthDays = totalCells - days.length;
    for (let day = 1; day <= nextMonthDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getMeetingsForDate = (date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduled_at);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateLong = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDurationText = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours}h`;
  };

  const getMeetingTypeIcon = (type) => {
    const meetingType = meetingTypes.find(t => t.value === type);
    return meetingType ? meetingType.icon : Video;
  };

  const getMeetingTypeColor = (type) => {
    const meetingType = meetingTypes.find(t => t.value === type);
    return meetingType ? meetingType.color : 'blue';
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (searchQuery) {
      return meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             meeting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             meeting.participants?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  if (loading && meetings.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Meeting Scheduler
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Schedule, join, and manage meetings with your team
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={`Switch to ${viewMode === 'calendar' ? 'list' : 'calendar'} view`}
          >
            {viewMode === 'calendar' ? <List className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={fetchAllMeetings}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Refresh meetings"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowNewMeetingModal(true)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Meetings', value: stats.total, color: 'blue', icon: CalendarIcon },
          { label: 'Scheduled', value: stats.scheduled, color: 'yellow', icon: Clock },
          { label: 'In Progress', value: stats.inProgress, color: 'orange', icon: Video },
          { label: 'Completed', value: stats.completed, color: 'green', icon: CheckCircle },
          { label: 'Today', value: stats.today, color: 'purple', icon: CalendarDays }
        ].map((stat) => (
          <div 
            key={stat.label}
            className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                darkMode 
                  ? `bg-${stat.color}-900/30 text-${stat.color}-400` 
                  : `bg-${stat.color}-100 text-${stat.color}-600`
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className={`p-4 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search meetings by title, description, or participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'border-gray-600 hover:bg-gray-700' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {showFilters ? <ChevronLeft className="ml-2 w-4 h-4" /> : <ChevronRight className="ml-2 w-4 h-4" />}
          </button>

          {/* Today Button */}
          <button
            onClick={navigateToToday}
            className={`px-4 py-2 rounded-lg border font-medium ${
              darkMode 
                ? 'border-blue-600 text-blue-400 hover:bg-blue-900/20' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            Today
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meeting Type Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Meeting Type
                </label>
                <select
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Types</option>
                  {meetingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Duration
                </label>
                <select
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">Any Duration</option>
                  {durations.map(duration => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <div className={`rounded-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Calendar Header */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  List View
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div 
                  key={day}
                  className={`text-center font-medium py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((day, index) => {
                const dayMeetings = getMeetingsForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isSelected = day.date.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (day.isCurrentMonth) {
                        setSelectedDate(day.date);
                        showDateDetail(day.date);
                      }
                    }}
                    className={`min-h-32 p-2 rounded-lg border cursor-pointer transition-all relative group ${
                      !day.isCurrentMonth
                        ? darkMode 
                          ? 'bg-gray-900/30 border-gray-800 text-gray-600' 
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                        : isSelected
                          ? darkMode 
                            ? 'bg-blue-900/30 border-blue-700' 
                            : 'bg-blue-50 border-blue-200'
                          : isToday
                            ? darkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-gray-100 border-gray-300'
                            : darkMode 
                              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium ${
                        !day.isCurrentMonth 
                          ? 'text-gray-500' 
                          : isToday
                            ? 'text-blue-600 dark:text-blue-400'
                            : darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      {dayMeetings.length > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {dayMeetings.length}
                        </span>
                      )}
                    </div>
                    
                    {/* Meetings for this day */}
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 2).map(meeting => {
                        const MeetingTypeIcon = getMeetingTypeIcon(meeting.meeting_type);
                        return (
                          <div
                            key={meeting.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMeeting(meeting);
                            }}
                            className={`p-1.5 rounded text-xs truncate cursor-pointer ${
                              darkMode 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <MeetingTypeIcon className={`w-3 h-3 mr-1 text-${getMeetingTypeColor(meeting.meeting_type)}-500`} />
                              <span className="truncate">{formatTime(meeting.scheduled_at)}</span>
                            </div>
                            <div className="truncate font-medium mt-0.5">
                              {meeting.title}
                            </div>
                          </div>
                        );
                      })}
                      {dayMeetings.length > 2 && (
                        <div className={`text-xs text-center py-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{dayMeetings.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Hover tooltip showing meeting count */}
                    {dayMeetings.length > 0 && (
                      <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-100'
                      }`}>
                        {dayMeetings.length} meeting{dayMeetings.length === 1 ? '' : 's'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // List View
        <div className={`rounded-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-12 gap-4 font-medium">
              <div className="col-span-5">Meeting</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Participants</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMeetings.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No meetings found
                </h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try changing your search or filters'
                    : 'Schedule your first meeting to get started!'}
                </p>
                <button
                  onClick={() => setShowNewMeetingModal(true)}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Schedule Meeting
                </button>
              </div>
            ) : (
              filteredMeetings.map((meeting) => {
                const MeetingTypeIcon = getMeetingTypeIcon(meeting.meeting_type);
                return (
                  <div 
                    key={meeting.id}
                    className={`px-6 py-4 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Meeting Details */}
                      <div className="col-span-5">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-lg mr-3 ${
                            darkMode 
                              ? `bg-${getMeetingTypeColor(meeting.meeting_type)}-900/30 text-${getMeetingTypeColor(meeting.meeting_type)}-400` 
                              : `bg-${getMeetingTypeColor(meeting.meeting_type)}-100 text-${getMeetingTypeColor(meeting.meeting_type)}-600`
                          }`}>
                            <MeetingTypeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {meeting.title}
                            </h4>
                            {meeting.description && (
                              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {meeting.description}
                              </p>
                            )}
                            <div className="flex items-center mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs mr-2 ${
                                darkMode 
                                  ? `bg-${getStatusColor(meeting.status)}-900/30 text-${getStatusColor(meeting.status)}-300` 
                                  : `bg-${getStatusColor(meeting.status)}-100 text-${getStatusColor(meeting.status)}-700`
                              }`}>
                                {meeting.status}
                              </span>
                              {meeting.meeting_type === 'in_person' && meeting.location && (
                                <span className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {meeting.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="col-span-2">
                        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDateTime(meeting.scheduled_at)}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <Clock className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {getDurationText(meeting.duration_minutes)}
                          </span>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <Users className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {meeting.participants?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center justify-center space-x-2">
                          {meeting.status === 'scheduled' && (
                            <button
                              onClick={() => handleJoinMeeting(meeting)}
                              className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-600 text-green-400' : 'hover:bg-gray-100 text-green-600'}`}
                              title="Join Meeting"
                            >
                              <Video className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => shareMeeting(meeting)}
                            className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title="Share Meeting"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditMeeting(meeting)}
                            className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                            title="Edit Meeting"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Date Detail Modal */}
      {showDateDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-4xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    Meetings for {formatDateLong(selectedDateForDetail)}
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {dateDetailMeetings.length} meeting{dateDetailMeetings.length === 1 ? '' : 's'} scheduled
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const dateStr = selectedDateForDetail.toISOString().slice(0, 10);
                      setNewMeeting({
                        ...newMeeting,
                        scheduled_at: `${dateStr}T09:00`
                      });
                      setShowDateDetailModal(false);
                      setShowNewMeetingModal(true);
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Meeting
                  </button>
                  <button
                    onClick={() => setShowDateDetailModal(false)}
                    className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {dateDetailMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className={`w-16 h-16 mx-auto mb-4 ${
                    darkMode ? 'text-gray-600' : 'text-gray-300'
                  }`} />
                  <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    No meetings scheduled
                  </h4>
                  <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Schedule a meeting for this day to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dateDetailMeetings.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)).map((meeting) => {
                    const MeetingTypeIcon = getMeetingTypeIcon(meeting.meeting_type);
                    const statusColor = getStatusColor(meeting.status);
                    
                    return (
                      <div 
                        key={meeting.id}
                        className={`p-4 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Meeting Info */}
                          <div className="flex-1">
                            <div className="flex items-start">
                              <div className={`p-3 rounded-lg mr-4 ${
                                darkMode 
                                  ? `bg-${getMeetingTypeColor(meeting.meeting_type)}-900/30 text-${getMeetingTypeColor(meeting.meeting_type)}-400` 
                                  : `bg-${getMeetingTypeColor(meeting.meeting_type)}-100 text-${getMeetingTypeColor(meeting.meeting_type)}-600`
                              }`}>
                                <MeetingTypeIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                  <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {meeting.title}
                                  </h4>
                                  <span className={`px-3 py-1 rounded-full text-sm ${
                                    darkMode 
                                      ? `bg-${statusColor}-900/30 text-${statusColor}-300` 
                                      : `bg-${statusColor}-100 text-${statusColor}-700`
                                  }`}>
                                    {meeting.status}
                                  </span>
                                </div>
                                
                                {/* Time and Duration */}
                                <div className="flex items-center flex-wrap gap-4 mb-3">
                                  <div className="flex items-center">
                                    <Clock className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {formatTime(meeting.scheduled_at)}
                                    </span>
                                  </div>
                                  <div className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                    <span className="text-sm">{getDurationText(meeting.duration_minutes)}</span>
                                  </div>
                                  {meeting.meeting_type === 'in_person' && meeting.location && (
                                    <div className="flex items-center">
                                      <MapPin className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                      <span className="text-sm">{meeting.location}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Description */}
                                {meeting.description && (
                                  <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {meeting.description}
                                  </p>
                                )}

                                {/* Participants */}
                                {meeting.participants && meeting.participants.length > 0 && (
                                  <div>
                                    <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      <Users className="w-4 h-4 inline mr-2" />
                                      Participants ({meeting.participants.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {meeting.participants.map((email, index) => (
                                        <span 
                                          key={index}
                                          className={`px-3 py-1 rounded-full text-sm ${
                                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                          }`}
                                        >
                                          {email}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Agenda */}
                                {meeting.agenda && (
                                  <div className="mt-4">
                                    <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Agenda
                                    </h5>
                                    <div className={`p-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                      <pre className={`whitespace-pre-wrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {meeting.agenda}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-2">
                            {meeting.status === 'scheduled' && (
                              <button
                                onClick={() => handleJoinMeeting(meeting)}
                                className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium ${
                                  darkMode 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                              >
                                <Video className="w-5 h-5 mr-2" />
                                Join
                              </button>
                            )}
                            <button
                              onClick={() => shareMeeting(meeting)}
                              className={`flex items-center justify-center px-4 py-2 rounded-lg border font-medium ${
                                darkMode 
                                  ? 'border-gray-600 hover:bg-gray-700' 
                                  : 'border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              <Share2 className="w-5 h-5 mr-2" />
                              Share
                            </button>
                            <button
                              onClick={() => copyMeetingLink(meeting)}
                              className={`flex items-center justify-center px-4 py-2 rounded-lg border font-medium ${
                                darkMode 
                                  ? 'border-gray-600 hover:bg-gray-700' 
                                  : 'border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              <Copy className="w-5 h-5 mr-2" />
                              Copy Link
                            </button>
                            <button
                              onClick={() => handleEditMeeting(meeting)}
                              className={`flex items-center justify-center px-4 py-2 rounded-lg border font-medium ${
                                darkMode 
                                  ? 'border-gray-600 hover:bg-gray-700' 
                                  : 'border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              <Edit className="w-5 h-5 mr-2" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-2xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                </h3>
                <button
                  onClick={() => {
                    setShowNewMeetingModal(false);
                    setEditingMeeting(null);
                    resetNewMeetingForm();
                  }}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={editingMeeting ? handleUpdateMeeting : handleCreateMeeting} className="p-6">
              <div className="space-y-6">
                {/* Title and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Team Standup, Client Meeting, etc."
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meeting Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {meetingTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setNewMeeting({...newMeeting, meeting_type: type.value})}
                            className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                              newMeeting.meeting_type === type.value
                                ? darkMode 
                                  ? `border-${type.color}-500 bg-${type.color}-900/30 text-${type.color}-400` 
                                  : `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-600`
                                : darkMode 
                                  ? 'border-gray-600 hover:bg-gray-700' 
                                  : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Date, Time, and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newMeeting.scheduled_at}
                      onChange={(e) => setNewMeeting({...newMeeting, scheduled_at: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Duration
                    </label>
                    <select
                      value={newMeeting.duration_minutes}
                      onChange={(e) => setNewMeeting({...newMeeting, duration_minutes: parseInt(e.target.value)})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {durations.map(duration => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location / Link
                    </label>
                    {newMeeting.meeting_type === 'video' || newMeeting.meeting_type === 'audio' ? (
                      <input
                        type="url"
                        value={newMeeting.meeting_link}
                        onChange={(e) => setNewMeeting({...newMeeting, meeting_link: e.target.value})}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      />
                    ) : (
                      <input
                        type="text"
                        value={newMeeting.location}
                        onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Conference Room A, Office Address"
                      />
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Meeting agenda, discussion points, objectives..."
                  />
                </div>

                {/* Participants */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Participants
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sampleParticipants.map(participant => (
                      <button
                        key={participant.email}
                        type="button"
                        onClick={() => {
                          const currentParticipants = newMeeting.participants || [];
                          const isSelected = currentParticipants.includes(participant.email);
                          const newParticipants = isSelected
                            ? currentParticipants.filter(p => p !== participant.email)
                            : [...currentParticipants, participant.email];
                          setNewMeeting({...newMeeting, participants: newParticipants});
                        }}
                        className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                          (newMeeting.participants || []).includes(participant.email)
                            ? darkMode 
                              ? 'bg-blue-900 text-blue-300' 
                              : 'bg-blue-100 text-blue-700'
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Users className="w-3 h-3 mr-2" />
                        {participant.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add email addresses (comma separated)"
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const email = e.target.value.trim();
                        if (email && isValidEmail(email)) {
                          const currentParticipants = newMeeting.participants || [];
                          if (!currentParticipants.includes(email)) {
                            setNewMeeting({
                              ...newMeeting,
                              participants: [...currentParticipants, email]
                            });
                          }
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </div>

                {/* Agenda */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Agenda (Optional)
                  </label>
                  <textarea
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({...newMeeting, agenda: e.target.value})}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="1. Review previous meeting minutes\n2. Project updates\n3. Action items\n4. Next steps"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewMeetingModal(false);
                    setEditingMeeting(null);
                    resetNewMeetingForm();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Meeting Modal */}
      {joiningMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-lg ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Join Meeting</h3>
                <button
                  onClick={() => setJoiningMeeting(null)}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {joiningMeeting.title}
              </h4>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Starts at {formatDateTime(joiningMeeting.scheduled_at)}
              </p>
              
              <div className="space-y-4">
                {joiningMeeting.meeting_link ? (
                  <a
                    href={joiningMeeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full px-4 py-3 rounded-lg font-medium text-center ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <ExternalLink className="w-5 h-5 inline mr-2" />
                    Open Meeting Link
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      const meetingLink = `https://meet.hisuru.com/${joiningMeeting.id}`;
                      window.open(meetingLink, '_blank');
                    }}
                    className={`w-full px-4 py-3 rounded-lg font-medium ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Video className="w-5 h-5 inline mr-2" />
                    Start Video Call
                  </button>
                )}
                
                <button
                  onClick={() => copyMeetingLink(joiningMeeting)}
                  className={`w-full px-4 py-3 rounded-lg border font-medium ${
                    darkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Copy className="w-5 h-5 inline mr-2" />
                  Copy Meeting Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}