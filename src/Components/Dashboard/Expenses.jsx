// src/components/Dashboard/Expenses.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
  Receipt,
  Tag,
  DollarSign,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';

export default function Expenses() {
  const { darkMode, user, fetchStats } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'other',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null,
    status: 'pending'
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const fileInputRef = useRef(null);

  // Expense categories
  const categories = [
    { value: 'office', label: 'Office Supplies', color: 'blue', icon: FileText },
    { value: 'travel', label: 'Travel', color: 'green', icon: TrendingUp },
    { value: 'meals', label: 'Meals & Entertainment', color: 'orange', icon: Calendar },
    { value: 'software', label: 'Software', color: 'purple', icon: CreditCard },
    { value: 'hardware', label: 'Hardware', color: 'red', icon: Wallet },
    { value: 'marketing', label: 'Marketing', color: 'pink', icon: BarChart3 },
    { value: 'utilities', label: 'Utilities', color: 'teal', icon: TrendingDown },
    { value: 'salary', label: 'Salary', color: 'indigo', icon: DollarSign },
    { value: 'other', label: 'Other', color: 'gray', icon: Tag }
  ];

  // Status options
  const statuses = [
    { value: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'approved', label: 'Approved', color: 'green', icon: Check },
    { value: 'rejected', label: 'Rejected', color: 'red', icon: X },
    { value: 'reimbursed', label: 'Reimbursed', color: 'blue', icon: DollarSign }
  ];

  // Date range options
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
    
    // Real-time subscription
    const subscription = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' }, 
        () => {
          fetchExpenses();
          fetchStats(); // Update overall stats
          fetchBudgets();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [filterCategory, filterDateRange, sortBy, sortOrder]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply filters
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      // Apply date range filter
      if (filterDateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch(filterDateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('year', new Date().getFullYear())
        .eq('month', new Date().getMonth() + 1);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const calculateStats = () => {
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const pending = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const approved = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const reimbursed = expenses
      .filter(e => e.status === 'reimbursed')
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

    // Calculate category totals
    const categoryTotals = categories.map(cat => ({
      ...cat,
      total: expenses
        .filter(e => e.category === cat.value)
        .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0)
    }));

    // Check budget alerts
    const budgetAlerts = budgets.map(budget => {
      const categoryExpense = expenses
        .filter(e => e.category === budget.category)
        .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
      
      const percentage = (categoryExpense / budget.amount) * 100;
      return {
        ...budget,
        spent: categoryExpense,
        percentage,
        alert: percentage >= 90
      };
    });

    return {
      total,
      pending,
      approved,
      reimbursed,
      categoryTotals,
      budgetAlerts,
      count: expenses.length
    };
  };

  const handleCreateExpense = async (e) => {
  e.preventDefault();
  try {
    console.log('Current user ID:', user?.id); // Debug log
    
    // Upload receipt if exists
    let receiptUrl = null;
    if (receiptFile) {
      try {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName);
        
        receiptUrl = publicUrl;
      } catch (uploadError) {
        console.warn('Receipt upload failed, continuing without receipt:', uploadError.message);
        // Continue without receipt
      }
    }

    // Create expense data with ALL required fields
    const expenseData = {
      user_id: user?.id, // This must match auth.uid() in RLS policy
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description || '',
      date: newExpense.date,
      receipt_url: receiptUrl,
      status: newExpense.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting expense data:', expenseData); // Debug log

    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    // Reset form
    setNewExpense({
      title: '',
      amount: '',
      category: 'other',
      description: '',
      date: new Date().toISOString().split('T')[0],
      receipt: null,
      status: 'pending'
    });
    setReceiptFile(null);
    setShowReceiptUpload(false);
    
    alert('Expense added successfully!');
    
    // Refresh expenses list
    fetchExpenses();
    
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // More specific error messages
    if (error.message.includes('row-level security policy')) {
      alert('Permission denied. The RLS policy is blocking this insert.\n\nRun the SQL fix below in Supabase SQL Editor.');
      console.log(`
        Run this SQL in Supabase SQL Editor:
        
        CREATE POLICY "Enable insert for authenticated users" 
        ON expenses FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = user_id);
      `);
    } else if (error.message.includes('null value')) {
      alert('Missing required field. Make sure all fields are filled.');
    } else {
      alert('Failed to add expense: ' + error.message);
    }
  }
};
  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          title: newExpense.title,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          description: newExpense.description,
          date: newExpense.date,
          status: newExpense.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingExpense.id);

      if (error) throw error;

      setEditingExpense(null);
      setNewExpense({
        title: '',
        amount: '',
        category: 'other',
        description: '',
        date: new Date().toISOString().split('T')[0],
        receipt: null,
        status: 'pending'
      });
      setShowReceiptUpload(false);
      
      alert('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      date: expense.date,
      receipt: null,
      status: expense.status
    });
    setShowReceiptUpload(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    setReceiptFile(file);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Title', 'Amount', 'Category', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.date,
        `"${expense.title}"`,
        expense.amount,
        expense.category,
        expense.status,
        `"${expense.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'gray';
  };

  const getStatusColor = (status) => {
    const stat = statuses.find(s => s.value === status);
    return stat ? stat.color : 'gray';
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : Tag;
  };

  const getStatusIcon = (status) => {
    const stat = statuses.find(s => s.value === status);
    return stat ? stat.icon : Clock;
  };

  const filteredExpenses = expenses.filter(expense => {
    if (searchQuery) {
      return expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             expense.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const stats = calculateStats();

  if (loading && expenses.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading expenses...</p>
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
            Expense Management
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track, categorize, and manage your expenses efficiently
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={showStats ? 'Hide stats' : 'Show stats'}
          >
            {showStats ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            onClick={fetchExpenses}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Refresh expenses"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleExportCSV}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowReceiptUpload(true)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total Expenses', 
              value: formatCurrency(stats.total),
              change: '0%',
              color: 'blue',
              icon: DollarSign
            },
            { 
              label: 'Pending', 
              value: formatCurrency(stats.pending),
              color: 'yellow',
              icon: Clock
            },
            { 
              label: 'Approved', 
              value: formatCurrency(stats.approved),
              color: 'green',
              icon: Check
            },
            { 
              label: 'Reimbursed', 
              value: formatCurrency(stats.reimbursed),
              color: 'teal',
              icon: CreditCard
            }
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
                  <p className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {stat.change}
                    </p>
                  )}
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
      )}

      {/* Budget Alerts */}
      {stats.budgetAlerts.filter(b => b.alert).length > 0 && (
        <div className={`p-4 rounded-xl border ${
          darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center">
            <AlertCircle className={`w-5 h-5 mr-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                Budget Alerts
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                {stats.budgetAlerts.filter(b => b.alert).map(b => (
                  <span key={b.category} className="mr-3">
                    {categories.find(c => c.value === b.category)?.label}: {b.percentage.toFixed(1)}%
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {showStats && (
        <div className={`p-4 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Category Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stats.categoryTotals
              .filter(cat => cat.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map(category => {
                const percentage = (category.total / stats.total) * 100;
                const Icon = category.icon;
                return (
                  <div key={category.value} className="text-center">
                    <div className={`inline-flex p-3 rounded-full mb-2 ${
                      darkMode 
                        ? `bg-${category.color}-900/30 text-${category.color}-400` 
                        : `bg-${category.color}-100 text-${category.color}-600`
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {category.label}
                    </p>
                    <p className={`text-lg font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(category.total)}
                    </p>
                    <div className={`h-2 mt-2 rounded-full overflow-hidden ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-full bg-${category.color}-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

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
                placeholder="Search expenses..."
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
              {/* Category Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Range
                </label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <Wallet className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-300'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No expenses found
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchQuery || filterCategory !== 'all' || filterDateRange !== 'all' 
              ? 'Try changing your search or filters'
              : 'Add your first expense to get started!'}
          </p>
          <button
            onClick={() => setShowReceiptUpload(true)}
            className={`px-6 py-3 rounded-lg font-medium ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add Expense
          </button>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-4 px-6 font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Date
                  </th>
                  <th className={`text-left py-4 px-6 font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Expense
                  </th>
                  <th className={`text-left py-4 px-6 font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Amount
                  </th>
                  <th className={`text-left py-4 px-6 font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </th>
                  <th className={`text-left py-4 px-6 font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                  <th className={`text-left py-4 px-6 font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const CategoryIcon = getCategoryIcon(expense.category);
                  const StatusIcon = getStatusIcon(expense.status);
                  return (
                    <tr 
                      key={expense.id}
                      className={`border-b ${
                        darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {new Date(expense.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {expense.title}
                          </p>
                          {expense.description && (
                            <p className={`text-sm truncate max-w-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {expense.description}
                            </p>
                          )}
                          {expense.receipt_url && (
                            <a
                              href={expense.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center text-sm mt-1 ${
                                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                              }`}
                            >
                              <Receipt className="w-3 h-3 mr-1" />
                              View Receipt
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatCurrency(expense.amount)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded mr-2 ${
                            darkMode 
                              ? `bg-${getCategoryColor(expense.category)}-900/30 text-${getCategoryColor(expense.category)}-400` 
                              : `bg-${getCategoryColor(expense.category)}-100 text-${getCategoryColor(expense.category)}-600`
                          }`}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <span className="capitalize">
                            {categories.find(c => c.value === expense.category)?.label || expense.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <StatusIcon className={`w-4 h-4 mr-2 text-${getStatusColor(expense.status)}-500`} />
                          <span className={`capitalize ${
                            darkMode 
                              ? `text-${getStatusColor(expense.status)}-300` 
                              : `text-${getStatusColor(expense.status)}-700`
                          }`}>
                            {expense.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className={`p-1.5 rounded ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                            title="Edit expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className={`p-1.5 rounded ${
                              darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                            }`}
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {expense.receipt_url && (
                            <a
                              href={expense.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1.5 rounded ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              }`}
                              title="View receipt"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {showReceiptUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg rounded-xl shadow-lg max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button
                  onClick={() => {
                    setShowReceiptUpload(false);
                    setEditingExpense(null);
                    setNewExpense({
                      title: '',
                      amount: '',
                      category: 'other',
                      description: '',
                      date: new Date().toISOString().split('T')[0],
                      receipt: null,
                      status: 'pending'
                    });
                    setReceiptFile(null);
                  }}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense} className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expense Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Office supplies, Client dinner, etc."
                  />
                </div>

                {/* Amount and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category *
                    </label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={newExpense.status}
                      onChange={(e) => setNewExpense({...newExpense, status: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Additional details about this expense..."
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Receipt (Optional)
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      darkMode 
                        ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {receiptFile 
                        ? `Selected: ${receiptFile.name}`
                        : 'Click to upload receipt (PDF, JPG, PNG up to 5MB)'
                      }
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {receiptFile && (
                    <button
                      type="button"
                      onClick={() => setReceiptFile(null)}
                      className={`text-sm mt-2 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiptUpload(false);
                    setEditingExpense(null);
                    setNewExpense({
                      title: '',
                      amount: '',
                      category: 'other',
                      description: '',
                      date: new Date().toISOString().split('T')[0],
                      receipt: null,
                      status: 'pending'
                    });
                    setReceiptFile(null);
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
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}