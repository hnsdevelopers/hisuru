// src/components/Dashboard/Email.jsx
import { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Star, 
  StarOff, 
  Paperclip, 
  Eye, 
  EyeOff,
  Clock,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  MoreVertical,
  X,
  Reply,
  Forward,
  Delete,
  Folder,
  Tag,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Printer,
  Link as LinkIcon,
  Sparkles,
  Bot,
  Zap,
  MessageSquare,
  AtSign,
  Calendar,
  FileText,
  Image,
  Mic,
  Smile,
  Send as SendIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';

export default function Email() {
  const { darkMode, user, fetchStats } = useOutletContext();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFolder, setFilterFolder] = useState('inbox'); // inbox, sent, draft, archived, trash
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'conversation'
  const [composingEmail, setComposingEmail] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingEmail, setForwardingEmail] = useState(null);
  const [readingEmail, setReadingEmail] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  const [newEmail, setNewEmail] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: [],
    priority: 'normal',
    scheduled_send: null
  });

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 0, color: 'blue' },
    { id: 'sent', name: 'Sent', icon: Send, count: 0, color: 'green' },
    { id: 'draft', name: 'Drafts', icon: FileText, count: 0, color: 'yellow' },
    { id: 'archived', name: 'Archived', icon: Archive, count: 0, color: 'purple' },
    { id: 'spam', name: 'Spam', icon: AlertCircle, count: 0, color: 'orange' },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0, color: 'red' }
  ];

  const categories = [
    { name: 'Primary', color: 'blue', unread: 0 },
    { name: 'Social', color: 'green', unread: 0 },
    { name: 'Promotions', color: 'purple', unread: 0 },
    { name: 'Updates', color: 'orange', unread: 0 },
    { name: 'Forums', color: 'red', unread: 0 }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'normal', label: 'Normal', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const aiEmailTemplates = [
    {
      name: 'Meeting Follow-up',
      content: 'Thank you for the meeting. Here are the key action items we discussed...',
      context: 'After meetings'
    },
    {
      name: 'Project Update',
      content: 'Here\'s the weekly update on the project progress...',
      context: 'Weekly reports'
    },
    {
      name: 'Client Response',
      content: 'Thank you for reaching out. I understand your concern about...',
      context: 'Customer support'
    },
    {
      name: 'Team Announcement',
      content: 'Important announcement regarding our upcoming plans...',
      context: 'Internal communications'
    }
  ];

  // Fetch emails on mount
  useEffect(() => {
    fetchEmails();
    
    // Real-time subscription
    const subscription = supabase
      .channel('emails-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'emails' }, 
        () => {
          fetchEmails();
          fetchStats();
        }
      )
      .subscribe();

    // Load AI suggestions
    loadAiSuggestions();

    return () => subscription.unsubscribe();
  }, [filterFolder]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('emails')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Apply folder filter
      if (filterFolder !== 'all') {
        if (filterFolder === 'inbox') {
          query = query.eq('folder', 'inbox').eq('archived', false).eq('trashed', false);
        } else if (filterFolder === 'sent') {
          query = query.eq('folder', 'sent');
        } else if (filterFolder === 'draft') {
          query = query.eq('draft', true);
        } else if (filterFolder === 'archived') {
          query = query.eq('archived', true);
        } else if (filterFolder === 'trash') {
          query = query.eq('trashed', true);
        } else if (filterFolder === 'spam') {
          query = query.eq('spam', true);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setEmails(data || []);

      // Update folder counts
      updateFolderCounts(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFolderCounts = (emails) => {
    const counts = {
      inbox: emails.filter(e => e.folder === 'inbox' && !e.archived && !e.trashed && !e.read).length,
      sent: emails.filter(e => e.folder === 'sent').length,
      draft: emails.filter(e => e.draft).length,
      archived: emails.filter(e => e.archived).length,
      trash: emails.filter(e => e.trashed).length,
      spam: emails.filter(e => e.spam).length
    };

    // Update folder counts
    folders.forEach(folder => {
      const folderElement = document.getElementById(`folder-${folder.id}-count`);
      if (folderElement) {
        folderElement.textContent = counts[folder.id];
      }
    });
  };

  const loadAiSuggestions = async () => {
    // In a real app, this would call an AI API
    const suggestions = [
      { type: 'reply', content: 'Thanks for the update! Looking forward to the next steps.', confidence: 0.95 },
      { type: 'schedule', content: 'Schedule a follow-up meeting for next week?', confidence: 0.88 },
      { type: 'delegate', content: 'Forward this to the design team for review.', confidence: 0.82 }
    ];
    setAiSuggestions(suggestions);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      const emailData = {
        user_id: user?.id,
        from: user?.email,
        to: newEmail.to.split(',').map(email => email.trim()),
        cc: newEmail.cc ? newEmail.cc.split(',').map(email => email.trim()) : [],
        bcc: newEmail.bcc ? newEmail.bcc.split(',').map(email => email.trim()) : [],
        subject: newEmail.subject,
        body: newEmail.body,
        priority: newEmail.priority,
        folder: 'sent',
        read: true,
        draft: false,
        attachments: newEmail.attachments,
        scheduled_send: newEmail.scheduled_send
      };

      const { data, error } = await supabase
        .from('emails')
        .insert([emailData])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setNewEmail({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        attachments: [],
        priority: 'normal',
        scheduled_send: null
      });
      setComposingEmail(false);
      
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email: ' + error.message);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const emailData = {
        user_id: user?.id,
        from: user?.email,
        to: newEmail.to.split(',').map(email => email.trim()),
        cc: newEmail.cc ? newEmail.cc.split(',').map(email => email.trim()) : [],
        bcc: newEmail.bcc ? newEmail.bcc.split(',').map(email => email.trim()) : [],
        subject: newEmail.subject,
        body: newEmail.body,
        priority: newEmail.priority,
        folder: 'draft',
        draft: true,
        attachments: newEmail.attachments
      };

      const { error } = await supabase
        .from('emails')
        .insert([emailData]);

      if (error) throw error;

      setComposingEmail(false);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleToggleStar = async (emailId, currentlyStarred) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ starred: !currentlyStarred, updated_at: new Date().toISOString() })
        .eq('id', emailId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleToggleRead = async (emailId, currentlyRead) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ read: !currentlyRead, updated_at: new Date().toISOString() })
        .eq('id', emailId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
  };

  const handleMoveToFolder = async (emailIds, targetFolder) => {
    try {
      const updates = {
        updated_at: new Date().toISOString()
      };

      if (targetFolder === 'trash') {
        updates.trashed = true;
        updates.archived = false;
      } else if (targetFolder === 'archive') {
        updates.archived = true;
        updates.trashed = false;
      } else if (targetFolder === 'inbox') {
        updates.archived = false;
        updates.trashed = false;
        updates.spam = false;
      } else if (targetFolder === 'spam') {
        updates.spam = true;
      }

      const { error } = await supabase
        .from('emails')
        .update(updates)
        .in('id', Array.from(emailIds));

      if (error) throw error;

      // Clear selection
      setSelectedEmails(new Set());
    } catch (error) {
      console.error('Error moving emails:', error);
    }
  };

  const handleDeleteEmails = async (emailIds) => {
    if (!window.confirm('Are you sure you want to delete these emails?')) return;

    try {
      // For permanent deletion from trash
      if (filterFolder === 'trash') {
        const { error } = await supabase
          .from('emails')
          .delete()
          .in('id', Array.from(emailIds));

        if (error) throw error;
      } else {
        // Move to trash
        await handleMoveToFolder(emailIds, 'trash');
      }

      setSelectedEmails(new Set());
    } catch (error) {
      console.error('Error deleting emails:', error);
    }
  };

  const handleReply = (email) => {
    setReplyingTo(email);
    setNewEmail({
      to: email.from || email.sender,
      subject: `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.from || email.sender}\nDate: ${formatDateTime(email.created_at)}\nSubject: ${email.subject}\n\n${email.body}`,
      attachments: [],
      priority: 'normal',
      scheduled_send: null
    });
    setComposingEmail(true);
  };

  const handleForward = (email) => {
    setForwardingEmail(email);
    setNewEmail({
      to: '',
      subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.from || email.sender}\nDate: ${formatDateTime(email.created_at)}\nSubject: ${email.subject}\nTo: ${email.to?.join(', ') || 'N/A'}\n\n${email.body}`,
      attachments: email.attachments || [],
      priority: 'normal',
      scheduled_send: null
    });
    setComposingEmail(true);
  };

  const handleSelectEmail = (emailId) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map(email => email.id)));
    }
  };

  const useAiTemplate = (template) => {
    setNewEmail({
      ...newEmail,
      body: template.content + '\n\n' + newEmail.body
    });
  };

  const getAiResponse = async (emailContent) => {
    // This would call an AI API in production
    return "Based on the email content, I suggest focusing on clear action items and setting follow-up deadlines.";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'gray';
  };

  const getFolderIcon = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.icon : Inbox;
  };

  const getFolderColor = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.color : 'blue';
  };

  const filteredEmails = emails.filter(email => {
    if (searchQuery) {
      return email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.to?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const stats = {
    total: emails.length,
    unread: emails.filter(e => !e.read).length,
    starred: emails.filter(e => e.starred).length,
    withAttachments: emails.filter(e => e.attachments && e.attachments.length > 0).length
  };

  if (loading && emails.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Sidebar */}
      <div className={`w-64 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        {/* Compose Button */}
        <button
          onClick={() => setComposingEmail(true)}
          className={`m-4 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Compose
        </button>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto px-4">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Folders
          </h3>
          <div className="space-y-1">
            {folders.map(folder => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => setFilterFolder(folder.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterFolder === folder.id
                      ? darkMode 
                        ? 'bg-blue-900/30 text-blue-300' 
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {folder.name}
                  </div>
                  <span id={`folder-${folder.id}-count`} className={`text-xs px-1.5 py-0.5 rounded-full ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {folder.id === 'inbox' ? stats.unread : folder.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Categories */}
          <h3 className={`text-xs font-semibold uppercase tracking-wider mt-6 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map(category => (
              <button
                key={category.name}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full bg-${category.color}-500 mr-3`}></div>
                  {category.name}
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {category.unread}
                </span>
              </button>
            ))}
          </div>

          {/* AI Assistant */}
          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center mb-3">
              <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium ${
                darkMode 
                  ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/40' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              <Bot className="w-4 h-4 mr-2" />
              Smart Replies
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Email Integration
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage all your emails in one unified inbox
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchEmails}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'conversation' : 'list')}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {viewMode === 'list' ? <MessageSquare className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search emails..."
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

            {/* Bulk Actions */}
            {selectedEmails.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedEmails.size} selected
                </span>
                <button
                  onClick={() => handleToggleRead(Array.from(selectedEmails)[0], true)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Mark as read"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleToggleStar(Array.from(selectedEmails)[0], false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Star"
                >
                  <Star className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleMoveToFolder(selectedEmails, 'archive')}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Archive"
                >
                  <Archive className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteEmails(selectedEmails)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Mail className={`w-24 h-24 mb-6 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No emails found
              </h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery || filterFolder !== 'inbox'
                  ? 'Try changing your search or folder'
                  : 'Your inbox is empty!'}
              </p>
              <button
                onClick={() => setComposingEmail(true)}
                className={`px-6 py-3 rounded-lg font-medium ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Compose New Email
              </button>
            </div>
          ) : (
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredEmails.map(email => {
                const FolderIcon = getFolderIcon(email.folder);
                return (
                  <div
                    key={email.id}
                    className={`flex items-start p-4 cursor-pointer transition-colors ${
                      selectedEmails.has(email.id)
                        ? darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                        : darkMode 
                          ? 'hover:bg-gray-800' 
                          : 'hover:bg-gray-50'
                    } ${!email.read ? (darkMode ? 'bg-gray-800' : 'bg-gray-50') : ''}`}
                    onClick={() => setReadingEmail(email)}
                  >
                    {/* Checkbox */}
                    <div className="mr-3 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(email.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectEmail(email.id);
                        }}
                        className={`w-4 h-4 rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(email.id, email.starred);
                      }}
                      className={`mr-3 pt-1 ${email.starred ? 'text-yellow-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {email.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>

                    {/* Sender and Subject */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <span className={`text-sm font-medium ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {email.from?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {email.from || 'Unknown Sender'}
                              </span>
                              {email.priority === 'high' && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                                  darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                                }`}>
                                  High
                                </span>
                              )}
                            </div>
                            <p className={`truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {email.subject || '(No subject)'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {email.attachments && email.attachments.length > 0 && (
                            <Paperclip className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                          <span className={`text-sm whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDateTime(email.created_at)}
                          </span>
                          <FolderIcon className={`w-4 h-4 text-${getFolderColor(email.folder)}-500`} />
                        </div>
                      </div>
                      
                      {/* Email Preview */}
                      <p className={`mt-2 text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {email.body?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>

                      {/* Quick Actions */}
                      <div className="flex items-center mt-3 space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReply(email);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          Reply
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleForward(email);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          Forward
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRead(email.id, email.read);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          {email.read ? 'Mark Unread' : 'Mark Read'}
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

      {/* Reading Pane */}
      {readingEmail && (
        <div className={`w-96 border-l ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {readingEmail.subject || '(No subject)'}
            </h3>
            <button
              onClick={() => setReadingEmail(null)}
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-16rem)]">
            {/* Email Header */}
            <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    <span className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {readingEmail.from?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {readingEmail.from || 'Unknown Sender'}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      to {readingEmail.to?.join(', ') || 'me'}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatFullDate(readingEmail.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReply(readingEmail)}
                    className={`p-2 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleForward(readingEmail)}
                    className={`p-2 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <Forward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStar(readingEmail.id, readingEmail.starred)}
                    className={`p-2 rounded ${readingEmail.starred ? 'text-yellow-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {readingEmail.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
              <div dangerouslySetInnerHTML={{ __html: readingEmail.body || '' }} />
            </div>

            {/* Attachments */}
            {readingEmail.attachments && readingEmail.attachments.length > 0 && (
              <div className="mt-6">
                <h5 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Attachments ({readingEmail.attachments.length})
                </h5>
                <div className="space-y-2">
                  {readingEmail.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        darkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <Paperclip className={`w-4 h-4 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {attachment.name || `attachment-${index + 1}`}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {attachment.size || 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <button className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {showAiAssistant && (
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                <div className="flex items-center mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                  <h5 className={`font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    AI Suggestions
                  </h5>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // Use AI suggestion
                        setNewEmail({
                          ...newEmail,
                          body: suggestion.content + '\n\n' + newEmail.body
                        });
                        setComposingEmail(true);
                        setReadingEmail(null);
                      }}
                      className={`w-full text-left p-2 rounded text-sm ${
                        darkMode ? 'hover:bg-purple-900/30' : 'hover:bg-purple-100'
                      }`}
                    >
                      {suggestion.content}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {composingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-4xl rounded-xl shadow-lg flex flex-col max-h-[90vh] ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold">
                {replyingTo ? 'Reply' : forwardingEmail ? 'Forward' : 'New Message'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveDraft}
                  className={`px-3 py-1.5 rounded text-sm ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Save Draft
                </button>
                <button
                  onClick={() => {
                    setComposingEmail(false);
                    setReplyingTo(null);
                    setForwardingEmail(null);
                    setNewEmail({
                      to: '',
                      cc: '',
                      bcc: '',
                      subject: '',
                      body: '',
                      attachments: [],
                      priority: 'normal',
                      scheduled_send: null
                    });
                  }}
                  className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleSendEmail} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Recipients */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className={`w-12 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>To</span>
                      <input
                        type="text"
                        required
                        value={newEmail.to}
                        onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                        className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div className="flex items-center mb-2">
                      <span className={`w-12 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cc</span>
                      <input
                        type="text"
                        value={newEmail.cc}
                        onChange={(e) => setNewEmail({...newEmail, cc: e.target.value})}
                        className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="cc@example.com"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className={`w-12 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bcc</span>
                      <input
                        type="text"
                        value={newEmail.bcc}
                        onChange={(e) => setNewEmail({...newEmail, bcc: e.target.value})}
                        className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="bcc@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <input
                      type="text"
                      required
                      value={newEmail.subject}
                      onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Subject"
                    />
                  </div>
                </div>

                {/* AI Templates */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      AI Email Templates
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiEmailTemplates.map(template => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => useAiTemplate(template)}
                        className={`px-3 py-1.5 rounded text-sm ${
                          darkMode 
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                            : 'bg-white hover:bg-gray-50 text-gray-700 border'
                        }`}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <textarea
                    value={newEmail.body}
                    onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
                    rows={12}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Write your message here..."
                  />
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiAssistant(!showAiAssistant)}
                      className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Bot className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={newEmail.priority}
                      onChange={(e) => setNewEmail({...newEmail, priority: e.target.value})}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${
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
                    <button
                      type="submit"
                      className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <SendIcon className="w-5 h-5 mr-2" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}