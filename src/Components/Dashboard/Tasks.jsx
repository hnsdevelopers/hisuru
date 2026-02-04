// src/components/Dashboard/Tasks.jsx
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  MoreVertical, 
  Edit, 
  Trash2,
  Archive,
  Tag,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Grid,
  List,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';

export default function Tasks() {
  const { darkMode, user, fetchStats } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tags: [],
    assignees: []
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'green', darkColor: 'emerald' },
    { value: 'medium', label: 'Medium', color: 'yellow', darkColor: 'amber' },
    { value: 'high', label: 'High', color: 'orange', darkColor: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red', darkColor: 'red' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'gray', icon: Circle },
    { value: 'in_progress', label: 'In Progress', color: 'blue', icon: Clock },
    { value: 'completed', label: 'Completed', color: 'green', icon: CheckCircle },
    { value: 'archived', label: 'Archived', color: 'purple', icon: Archive }
  ];

  const sampleTags = [
    { name: 'Work', color: 'blue' },
    { name: 'Personal', color: 'green' },
    { name: 'Urgent', color: 'red' },
    { name: 'Project', color: 'purple' },
    { name: 'Meeting', color: 'orange' }
  ];

  // Fetch tasks on mount and setup real-time subscription
  useEffect(() => {
    fetchTasks();
    
    // Real-time subscription
    const subscription = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' }, 
        () => {
          fetchTasks();
          fetchStats(); // Update overall stats
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [filterStatus, filterPriority, sortBy, sortOrder]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply filters
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (filterPriority !== 'all') {
        query = query.eq('priority', filterPriority);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user?.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          tags: newTask.tags,
          status: 'pending',
          assignees: newTask.assignees
        }])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        tags: [],
        assignees: []
      });
      setShowNewTaskModal(false);
      
      // Show success message
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // const handleToggleComplete = async (task) => {
  //   const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  //   await handleUpdateTaskStatus(task.id, newStatus);
  // };

  const handleToggleComplete = async (task) => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed';

  // Optimistic UI update
  setTasks((prevTasks) =>
    prevTasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t
    )
  );

  try {
    await handleUpdateTaskStatus(task.id, newStatus);
  } catch (error) {
    // rollback if API fails
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, status: task.status } : t
      )
    );
  }
};


  const handleToggleImportant = async (task) => {
    const currentTags = task.tags || [];
    const isImportant = currentTags.includes('important');
    const newTags = isImportant 
      ? currentTags.filter(tag => tag !== 'important')
      : [...currentTags, 'important'];

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ tags: newTags, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task importance:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      tags: task.tags || [],
      assignees: task.assignees || []
    });
    setShowNewTaskModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...newTask,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      setShowNewTaskModal(false);
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        tags: [],
        assignees: []
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'gray';
  };

  const getStatusIcon = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.icon : Circle;
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  if (loading && tasks.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading tasks...</p>
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
            Task Management
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Organize, prioritize, and track your tasks efficiently
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
          >
            {viewMode === 'list' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
          <button
            onClick={fetchTasks}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Refresh tasks"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'blue', icon: List },
          { label: 'Pending', value: stats.pending, color: 'yellow', icon: Clock },
          { label: 'In Progress', value: stats.inProgress, color: 'orange', icon: RefreshCw },
          { label: 'Completed', value: stats.completed, color: 'green', icon: CheckCircle }
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
                placeholder="Search tasks..."
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
            {showFilters ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
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

              {/* Priority Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="created_at">Created Date</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List/Grid */}
      {filteredTasks.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-300'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No tasks found
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' 
              ? 'Try changing your search or filters'
              : 'Create your first task to get started!'}
          </p>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className={`px-6 py-3 rounded-lg font-medium ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create New Task
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div 
              key={task.id}
              className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mr-3 ${task.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                        darkMode 
                          ? `bg-${getPriorityColor(task.priority)}-900/30 text-${getPriorityColor(task.priority)}-300` 
                          : `bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-700`
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        darkMode 
                          ? `bg-${getStatusColor(task.status)}-900/30 text-${getStatusColor(task.status)}-300` 
                          : `bg-${getStatusColor(task.status)}-100 text-${getStatusColor(task.status)}-700`
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleImportant(task)}
                  className={`p-1 ${(task.tags || []).includes('important') ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  {(task.tags || []).includes('important') ? (
                    <Star className="w-5 h-5" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
              </div>

              {task.description && (
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDate(task.due_date)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className={`rounded-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="grid grid-cols-12 gap-4 font-medium">
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-4">Task</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Tags</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              return (
                <div 
                  key={task.id}
                  className={`px-6 py-4 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Status */}
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`${
                          task.status === 'completed' 
                            ? 'text-green-500' 
                            : darkMode ? 'text-gray-400' : 'text-gray-300'
                        }`}
                      >
                        <StatusIcon className="w-5 h-5 mx-auto" />
                      </button>
                    </div>

                    {/* Task Title */}
                    <div className="col-span-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleToggleImportant(task)}
                          className={`mr-3 ${(task.tags || []).includes('important') ? 'text-yellow-500' : 'text-gray-400'}`}
                        >
                          {(task.tags || []).includes('important') ? (
                            <Star className="w-4 h-4" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? `bg-${getPriorityColor(task.priority)}-900/30 text-${getPriorityColor(task.priority)}-300` 
                          : `bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-700`
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <Calendar className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {(task.tags || []).slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className={`px-2 py-0.5 rounded text-xs ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {(task.tags || []).length > 2 && (
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            +{(task.tags || []).length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-xl shadow-lg ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => {
                    setShowNewTaskModal(false);
                    setEditingTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'medium',
                      due_date: '',
                      tags: [],
                      assignees: []
                    });
                  }}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="What needs to be done?"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Add details about this task..."
                  />
                </div>

                {/* Priority and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {sampleTags.map(tag => (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => {
                          const currentTags = newTask.tags || [];
                          const newTags = currentTags.includes(tag.name)
                            ? currentTags.filter(t => t !== tag.name)
                            : [...currentTags, tag.name];
                          setNewTask({...newTask, tags: newTags});
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          (newTask.tags || []).includes(tag.name)
                            ? darkMode 
                              ? `bg-${tag.color}-900 text-${tag.color}-300` 
                              : `bg-${tag.color}-100 text-${tag.color}-700`
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTaskModal(false);
                    setEditingTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'medium',
                      due_date: '',
                      tags: [],
                      assignees: []
                    });
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
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}