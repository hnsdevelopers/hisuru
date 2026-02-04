// src/pages/dashboard/Settings.jsx
import { useState, useEffect } from 'react';
import { 
  Mail, Users, Shield, Bell, CreditCard, Globe, Key, Save,
  TestTube, CheckCircle, XCircle, Plus, Trash2, Edit,
  RefreshCw, Eye, EyeOff, User, Lock, AlertCircle,
  Download, Upload, ExternalLink, Moon, Sun
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showMailgunKey, setShowMailgunKey] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // User Profile
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en'
  });

  // Email Configuration
  const [emailConfig, setEmailConfig] = useState({
    mailgunApiKey: '',
    mailgunDomain: '',
    smtpHost: 'smtp.mailgun.org',
    smtpPort: '587',
    fromEmail: 'noreply@sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org',
    fromName: 'HiSuru',
    enableNotifications: true,
    enableEmailSync: false
  });

  // Team Management
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'member'
  });

  // Security
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 24,
    loginNotifications: true
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    taskReminders: true,
    meetingAlerts: true,
    weeklyDigest: true,
    marketingEmails: false
  });

  // API & Integrations
  const [integrations, setIntegrations] = useState({
    apiKey: null,
    webhookUrl: '',
    googleCalendar: false,
    slack: false,
    github: false,
    stripe: false
  });

  // Fetch initial data
  useEffect(() => {
    fetchUserData();
    fetchSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setProfile({
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          company: user.user_metadata?.company || '',
          phone: user.user_metadata?.phone || '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'en'
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        if (settings.email_config) {
          setEmailConfig(prev => ({
            ...prev,
            ...settings.email_config
          }));
        }
        
        if (settings.settings) {
          const savedSettings = settings.settings;
          if (savedSettings.notifications) setNotifications(savedSettings.notifications);
          if (savedSettings.security) setSecurity(savedSettings.security);
          if (savedSettings.integrations) setIntegrations(savedSettings.integrations);
        }
      }

      // Fetch team members
      const { data: team } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setTeamMembers(team || []);

      // Fetch API key
      const { data: apiKey } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user.id)
        .eq('revoked', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (apiKey) {
        setIntegrations(prev => ({ ...prev, apiKey: apiKey.key }));
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          company: profile.company,
          phone: profile.phone
        }
      });

      if (userError) throw userError;

      // Save settings to database
      const settingsData = {
        notifications,
        security,
        integrations: {
          ...integrations,
          apiKey: undefined // Don't save API key in settings
        }
      };

      // Use upsert to handle both insert and update
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_config: emailConfig,
          settings: settingsData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (settingsError) throw settingsError;

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailConfiguration = async () => {
    if (!emailConfig.mailgunApiKey || !emailConfig.mailgunDomain) {
      alert('Please configure Mailgun API Key and Domain first');
      return;
    }

    setTestEmailStatus('sending');
    try {
      // Using Mailgun's client-side API (for sandbox only)
      const formData = new FormData();
      formData.append('from', `${emailConfig.fromName} <${emailConfig.fromEmail}>`);
      formData.append('to', profile.email);
      formData.append('subject', 'HiSuru Email Configuration Test');
      formData.append('text', 'This is a test email to verify your Mailgun configuration is working correctly.');

      const response = await fetch(
        `https://api.mailgun.net/v3/${emailConfig.mailgunDomain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + btoa(`api:${emailConfig.mailgunApiKey}`)
          },
          body: formData
        }
      );

      if (response.ok) {
        setTestEmailStatus('success');
        alert('Test email sent successfully! Check your inbox.');
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error('Email test error:', error);
      setTestEmailStatus('error');
      alert('Failed to send test email. Check your configuration.');
    }
  };

  const addTeamMember = async () => {
    if (!newMember.email || !user) {
      alert('Please enter email address');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          email: newMember.email,
          name: newMember.name,
          role: newMember.role,
          status: 'invited'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('Team member with this email already exists');
        } else {
          throw error;
        }
        return;
      }

      // Send invitation (simplified for now)
      await sendInvitationEmail(newMember.email, newMember.name);

      setTeamMembers([data, ...teamMembers]);
      setNewMember({ email: '', name: '', role: 'member' });
      alert('Team member invited successfully!');
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member');
    }
  };

  const sendInvitationEmail = async (email, name) => {
    // Simplified - in production, use your backend
    console.log('Sending invitation to:', email, 'for:', name);
    // You would typically call a backend endpoint here
  };

  const removeTeamMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      alert('Team member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member');
    }
  };

  const generateApiKey = async () => {
    if (!user) return;

    try {
      const apiKey = `sk_live_${Math.random().toString(36).substr(2, 32)}`;
      
      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key: apiKey,
          name: 'Primary API Key'
        });

      if (error) throw error;

      setIntegrations(prev => ({ ...prev, apiKey }));
      alert('API Key generated successfully!');
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key');
    }
  };

  const revokeApiKey = async () => {
    if (!user || !integrations.apiKey) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked: true })
        .eq('user_id', user.id)
        .eq('key', integrations.apiKey);

      if (error) throw error;

      setIntegrations(prev => ({ ...prev, apiKey: null }));
      alert('API Key revoked successfully');
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const exportSettings = () => {
    const data = {
      profile,
      emailConfig: { ...emailConfig, mailgunApiKey: '***HIDDEN***' },
      security,
      notifications,
      integrations: { ...integrations, apiKey: '***HIDDEN***' },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisuru-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.profile) setProfile(data.profile);
        if (data.emailConfig) setEmailConfig(data.emailConfig);
        if (data.security) setSecurity(data.security);
        if (data.notifications) setNotifications(data.notifications);
        if (data.integrations) setIntegrations(data.integrations);
        
        alert('Settings imported successfully! Click "Save Changes" to apply.');
      } catch (error) {
        alert('Failed to import settings. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-5 h-5" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account, team, and integrations
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={exportSettings}
            className="flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
          <label className="flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Email Configuration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Configure your email settings for notifications and invitations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mailgun API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mailgun API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showMailgunKey ? "text" : "password"}
                      value={emailConfig.mailgunApiKey}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, mailgunApiKey: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Mailgun API Key"
                    />
                    <button
                      onClick={() => setShowMailgunKey(!showMailgunKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showMailgunKey ? (
                        <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mailgun Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mailgun Domain
                  </label>
                  <input
                    type="text"
                    value={emailConfig.mailgunDomain}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, mailgunDomain: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sandboxxxx.mailgun.org"
                  />
                </div>

                {/* Test Email Button */}
                <div className="md:col-span-2">
                  <button
                    onClick={testEmailConfiguration}
                    disabled={testEmailStatus === 'sending' || !emailConfig.mailgunApiKey || !emailConfig.mailgunDomain}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testEmailStatus === 'sending' ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Sending Test Email...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-5 h-5 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </button>
                  
                  {testEmailStatus === 'success' && (
                    <div className="mt-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-green-800 dark:text-green-300">
                          Test email sent successfully! Check your inbox.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {testEmailStatus === 'error' && (
                    <div className="mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                      <div className="flex items-center">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-red-800 dark:text-red-300">
                          Failed to send test email. Check your configuration.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Team Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Invite and manage team members
                </p>
              </div>

              {/* Add Team Member Form */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Invite Team Member
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="team@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addTeamMember}
                  className="mt-4 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Send Invitation
                </button>
              </div>

              {/* Team Members List */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Team Members ({teamMembers.length})
                </h4>
                {teamMembers.length > 0 ? (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="col-span-4 font-medium text-sm">Name</div>
                      <div className="col-span-4 font-medium text-sm">Email</div>
                      <div className="col-span-2 font-medium text-sm">Role</div>
                      <div className="col-span-2 font-medium text-sm">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="grid grid-cols-12 px-4 py-3 items-center">
                          <div className="col-span-4">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {member.name || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {member.status === 'invited' ? 'Invitation sent' : 'Active'}
                            </p>
                          </div>
                          <div className="col-span-4">
                            <p className="text-gray-700 dark:text-gray-300">
                              {member.email}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.role === 'admin'
                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                                : member.role === 'manager'
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                          <div className="col-span-2 flex space-x-2">
                            <button
                              onClick={() => removeTeamMember(member.id)}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No team members yet. Invite your first team member above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  API & Integrations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Manage your API keys and third-party integrations
                </p>
              </div>

              {/* API Key Section */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      API Key
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Use this key to authenticate API requests
                    </p>
                  </div>
                  {integrations.apiKey ? (
                    <button
                      onClick={revokeApiKey}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      Revoke Key
                    </button>
                  ) : (
                    <button
                      onClick={generateApiKey}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      Generate API Key
                    </button>
                  )}
                </div>

                {integrations.apiKey && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your API Key
                    </label>
                    <div className="flex items-center">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={integrations.apiKey}
                        readOnly
                        className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Keep this key secret. It provides full access to your account.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}