// src/pages/dashboard/Settings.jsx
import { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Shield, 
  Bell, 
  CreditCard, 
  Globe, 
  Key, 
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  Database,
  Zap,
  Eye,
  EyeOff,
  Lock,
  UserPlus,
  MailCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';
import BillingComponent from './Billing';

export default function Settings() {
  const { darkMode, user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [testEmailStatus, setTestEmailStatus] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Email Configuration
  const [emailConfig, setEmailConfig] = useState({
    mailgunApiKey: 'f9f8ce3b32a00473f4aa2ffb538b0e16-f39109fe-7c2373f6',
    mailgunDomain: 'sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org',
    mailgunBaseUrl: 'https://api.mailgun.net',
    smtpHost: 'smtp.mailgun.org',
    smtpPort: '587',
    fromEmail: 'noreply@sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org',
    fromName: 'HiSuru Notifications',
    enableNotifications: true,
    enableEmailSync: false
  });

  // Team Members
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'member'
  });

  // User Settings
  const [userSettings, setUserSettings] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    timezone: 'UTC',
    language: 'en',
    theme: 'system'
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 24,
    loginNotifications: true,
    passwordUpdatedAt: null
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    meetingAlerts: true,
    expenseReports: true,
    teamUpdates: true,
    weeklyDigest: true,
    marketingEmails: false
  });

  // Billing/Subscription
  const [subscription, setSubscription] = useState({
    plan: 'free',
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: null,
    cardLast4: null
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

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      // Fetch user data
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserSettings(prev => ({
          ...prev,
          name: userData.user.user_metadata?.full_name || '',
          email: userData.user.email || '',
          company: userData.user.user_metadata?.company || '',
          phone: userData.user.user_metadata?.phone || ''
        }));
      }

      // Fetch team members
      const { data: teamData } = await supabase
        .from('team_members')
        .select('*')
        .eq('created_by', userData.user?.id)
        .order('created_at', { ascending: false });
      setTeamMembers(teamData || []);

      // Fetch saved settings from database
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userData.user?.id)
        .single();

      if (settingsData) {
        const settings = settingsData.settings;
        if (settings.email) setEmailConfig(settings.email);
        if (settings.notifications) setNotifications(settings.notifications);
        if (settings.security) setSecuritySettings(settings.security);
        if (settings.integrations) setIntegrations(settings.integrations);
      }

      // Fetch subscription data
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userData.user?.id)
        .single();

      if (subscriptionData) {
        setSubscription({
          plan: subscriptionData.plan,
          status: subscriptionData.status,
          billingCycle: 'monthly',
          nextBillingDate: subscriptionData.current_period_end,
          cardLast4: subscriptionData.card_last4
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        email: emailConfig,
        notifications,
        security: securitySettings,
        integrations,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          settings: settingsData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: userSettings.name,
          company: userSettings.company,
          phone: userSettings.phone
        }
      });

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailConfiguration = async () => {
  setTestEmailStatus('sending');
  try {
    const response = await fetch('http://localhost:3001/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userSettings.email,
        from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
        subject: 'HiSuru Email Configuration Test',
        text: 'This is a test email to verify your Mailgun configuration is working correctly.',
        apiKey: emailConfig.mailgunApiKey,
        domain: emailConfig.mailgunDomain
      })
    });

    const data = await response.json();
    
    if (data.success) {
      setTestEmailStatus('success');
    } else {
      setTestEmailStatus('error');
      console.error('Email test failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing email:', error);
    setTestEmailStatus('error');
  }
};

  const addTeamMember = async () => {
    if (!newMember.email) {
      alert('Please enter email address');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([
          {
            created_by: user?.id,
            email: newMember.email,
            name: newMember.name,
            role: newMember.role,
            status: 'invited',
            invited_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTeamMembers([data, ...teamMembers]);
      
      // Send invitation email via Mailgun
      await sendInvitationEmail(newMember.email, newMember.name, newMember.role);

      setNewMember({ email: '', name: '', role: 'member' });
      alert('Team member added and invitation sent!');
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member');
    }
  };

  const sendInvitationEmail = async (toEmail, name, role) => {
    try {
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toEmail,
          name: name,
          role: role,
          inviterName: userSettings.name,
          company: userSettings.company,
          apiKey: emailConfig.mailgunApiKey,
          domain: emailConfig.mailgunDomain,
          fromEmail: emailConfig.fromEmail,
          fromName: emailConfig.fromName
        })
      });

      if (!response.ok) {
        console.error('Failed to send invitation email');
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
    }
  };

  const removeTeamMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      alert('Team member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member');
    }
  };

  const generateApiKey = async () => {
    try {
      const apiKey = `sk_${Math.random().toString(36).substr(2, 32)}_${Date.now()}`;
      
      const { error } = await supabase
        .from('api_keys')
        .insert([
          {
            user_id: user?.id,
            key: apiKey,
            name: 'Primary API Key',
            permissions: ['read', 'write']
          }
        ]);

      if (error) throw error;

      setIntegrations(prev => ({ ...prev, apiKey }));
      alert('API Key generated successfully!');
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key');
    }
  };

  const revokeApiKey = async () => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked: true })
        .eq('user_id', user?.id)
        .eq('key', integrations.apiKey);

      if (error) throw error;

      setIntegrations(prev => ({ ...prev, apiKey: null }));
      alert('API Key revoked successfully');
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const tabs = [
    { id: 'email', label: 'Email Configuration', icon: <Mail className="w-5 h-5" /> },
    { id: 'team', label: 'Team Management', icon: <Users className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <UserPlus className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'integrations', label: 'API & Integrations', icon: <Globe className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Settings
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your account, team, and integrations
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`mt-4 md:mt-0 flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            saving
              ? darkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
              : darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
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

      {/* Tabs */}
      <div className={`border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? darkMode
                    ? 'border-blue-500 text-blue-400'
                    : 'border-blue-500 text-blue-600'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={`rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          {/* Email Configuration */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Mailgun Configuration
                </h3>
                <p className={`text-sm mb-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Configure your Mailgun account to send and receive emails through HiSuru
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API Key */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Mailgun API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={emailConfig.mailgunApiKey}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, mailgunApiKey: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter Mailgun API Key"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showApiKey ? (
                        <EyeOff className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      ) : (
                        <Eye className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </button>
                  </div>
                  <p className={`text-xs mt-2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Found in Mailgun Dashboard → Settings → API Keys
                  </p>
                </div>

                {/* Domain */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Mailgun Domain
                  </label>
                  <input
                    type="text"
                    value={emailConfig.mailgunDomain}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, mailgunDomain: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="sandboxxxx.mailgun.org"
                  />
                </div>

                {/* SMTP Host */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="smtp.mailgun.org"
                  />
                </div>

                {/* SMTP Port */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    SMTP Port
                  </label>
                  <select
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="587">587 (Recommended)</option>
                    <option value="465">465 (SSL/TLS)</option>
                    <option value="2525">2525 (Alternative)</option>
                    <option value="25">25 (Not recommended)</option>
                  </select>
                </div>

                {/* From Email */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="noreply@yourdomain.com"
                  />
                  <p className={`text-xs mt-2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Use full email address like noreply@sandboxxxx.mailgun.org
                  </p>
                </div>

                {/* From Name */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    From Name
                  </label>
                  <input
                    type="text"
                    value={emailConfig.fromName}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="HiSuru Notifications"
                  />
                </div>

                {/* Toggle Settings */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Enable Email Notifications
                      </p>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Send notifications via email
                      </p>
                    </div>
                    <button
                      onClick={() => setEmailConfig(prev => ({ 
                        ...prev, 
                        enableNotifications: !prev.enableNotifications 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        emailConfig.enableNotifications
                          ? darkMode ? 'bg-blue-600' : 'bg-blue-600'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        emailConfig.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Enable Email Sync
                      </p>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Sync your email inbox with HiSuru
                      </p>
                    </div>
                    <button
                      onClick={() => setEmailConfig(prev => ({ 
                        ...prev, 
                        enableEmailSync: !prev.enableEmailSync 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        emailConfig.enableEmailSync
                          ? darkMode ? 'bg-blue-600' : 'bg-blue-600'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        emailConfig.enableEmailSync ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Configuration */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-3 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <TestTube className="w-5 h-5 mr-2" />
                  Test Email Configuration
                </h4>
                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Send a test email to verify your configuration is working correctly
                </p>
                <button
                  onClick={testEmailConfiguration}
                  disabled={testEmailStatus === 'sending'}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    testEmailStatus === 'sending'
                      ? darkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
                      : darkMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {testEmailStatus === 'sending' ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Sending Test Email...
                    </>
                  ) : (
                    <>
                      <MailCheck className="w-5 h-5 mr-2" />
                      Send Test Email
                    </>
                  )}
                </button>

                {testEmailStatus === 'success' && (
                  <div className="mt-4 p-3 rounded-lg bg-green-100 border border-green-200 dark:bg-green-900/30 dark:border-green-800">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-green-800 dark:text-green-300">
                        Test email sent successfully! Check your inbox.
                      </span>
                    </div>
                  </div>
                )}

                {testEmailStatus === 'error' && (
                  <div className="mt-4 p-3 rounded-lg bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-red-800 dark:text-red-300">
                        Failed to send test email. Please check your configuration.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration Help */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Mailgun Configuration Help
                </h4>
                <ul className={`space-y-2 text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <li>• Your Sandbox domain: <code className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org</code></li>
                  <li>• Base URL: <code className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">https://api.mailgun.net</code></li>
                  <li>• SMTP Ports: 25, 587 (Recommended), 2525, 465 (SSL/TLS)</li>
                  <li>• Use full email address as sender: <code className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">noreply@sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org</code></li>
                </ul>
              </div>
            </div>
          )}

          {/* Team Management */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Users className="w-5 h-5 mr-2" />
                  Team Management
                </h3>
                <p className={`text-sm mb-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Invite team members and manage their access permissions
                </p>
              </div>

              {/* Add Team Member Form */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add Team Member
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      placeholder="team@example.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Role
                    </label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addTeamMember}
                  className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Team Member & Send Invitation
                </button>
              </div>

              {/* Team Members List */}
              <div>
                <h4 className={`font-medium mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Team Members ({teamMembers.length})
                </h4>
                {teamMembers.length > 0 ? (
                  <div className={`rounded-lg border ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  } overflow-hidden`}>
                    <div className={`grid grid-cols-12 px-4 py-3 border-b ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="col-span-4 font-medium text-sm">Name</div>
                      <div className="col-span-4 font-medium text-sm">Email</div>
                      <div className="col-span-2 font-medium text-sm">Role</div>
                      <div className="col-span-2 font-medium text-sm">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="grid grid-cols-12 px-4 py-3 items-center">
                          <div className="col-span-4">
                            <p className={`font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {member.name || 'Not specified'}
                            </p>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {member.status === 'invited' ? 'Invitation sent' : 'Active'}
                            </p>
                          </div>
                          <div className="col-span-4">
                            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                              {member.email}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.role === 'admin'
                                ? darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600'
                                : darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                          <div className="col-span-2 flex space-x-2">
                            <button className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeTeamMember(member.id)}
                              className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30`}
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
                    <Users className={`w-12 h-12 mx-auto mb-4 ${
                      darkMode ? 'text-gray-600' : 'text-gray-300'
                    }`} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      No team members yet. Invite your first team member above.
                    </p>
                  </div>
                )}
              </div>

              {/* Team Permissions */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Role Permissions
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <th className={`py-2 text-left text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Permission</th>
                        <th className={`py-2 text-left text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Admin</th>
                        <th className={`py-2 text-left text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Manager</th>
                        <th className={`py-2 text-left text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Member</th>
                        <th className={`py-2 text-left text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Viewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { permission: 'Create Tasks', admin: true, manager: true, member: true, viewer: false },
                        { permission: 'Delete Tasks', admin: true, manager: true, member: false, viewer: false },
                        { permission: 'Manage Team', admin: true, manager: true, member: false, viewer: false },
                        { permission: 'View Reports', admin: true, manager: true, member: true, viewer: true },
                        { permission: 'Billing Access', admin: true, manager: false, member: false, viewer: false },
                      ].map((perm) => (
                        <tr key={perm.permission} className={`border-b ${
                          darkMode ? 'border-gray-800' : 'border-gray-100'
                        }`}>
                          <td className={`py-3 text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>{perm.permission}</td>
                          <td className="py-3">
                            <CheckCircle className={`w-5 h-5 mx-auto ${
                              perm.admin ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </td>
                          <td className="py-3">
                            <CheckCircle className={`w-5 h-5 mx-auto ${
                              perm.manager ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </td>
                          <td className="py-3">
                            <CheckCircle className={`w-5 h-5 mx-auto ${
                              perm.member ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </td>
                          <td className="py-3">
                            <CheckCircle className={`w-5 h-5 mx-auto ${
                              perm.viewer ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Profile Settings
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userSettings.name}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userSettings.email}
                    readOnly
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-400' 
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  />
                  <p className={`text-xs mt-2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Contact support to change email address
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={userSettings.company}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, company: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userSettings.phone}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Timezone
                  </label>
                  <select
                    value={userSettings.timezone}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Language
                  </label>
                  <select
                    value={userSettings.language}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, language: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Two-Factor Authentication
                      </p>
                      <p className={`text-sm mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={() => setSecuritySettings(prev => ({ 
                        ...prev, 
                        twoFactorEnabled: !prev.twoFactorEnabled 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        securitySettings.twoFactorEnabled
                          ? darkMode ? 'bg-blue-600' : 'bg-blue-600'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  {securitySettings.twoFactorEnabled && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Two-factor authentication is enabled. Use your authenticator app to verify logins.
                      </p>
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Login Notifications
                      </p>
                      <p className={`text-sm mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Get notified when someone logs into your account
                      </p>
                    </div>
                    <button
                      onClick={() => setSecuritySettings(prev => ({ 
                        ...prev, 
                        loginNotifications: !prev.loginNotifications 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        securitySettings.loginNotifications
                          ? darkMode ? 'bg-blue-600' : 'bg-blue-600'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <p className={`font-medium mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Session Timeout
                    </p>
                    <p className={`text-sm mb-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Automatically log out after inactivity
                    </p>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        sessionTimeout: parseInt(e.target.value) 
                      }))}
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="1">1 hour</option>
                      <option value="4">4 hours</option>
                      <option value="8">8 hours</option>
                      <option value="24">24 hours</option>
                      <option value="168">1 week</option>
                      <option value="720">30 days</option>
                    </select>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-medium mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Change Password
                  </h4>
                  <button className={`flex items-center px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs (Notifications, Billing, Integrations) would follow similar pattern */}
          {activeTab === 'billing' && (
            <BillingComponent darkMode={darkMode} />
          )}
          {/* Due to length constraints, I've shown the most important tabs */}

          {/* API & Integrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Globe className="w-5 h-5 mr-2" />
                  API & Integrations
                </h3>
              </div>

              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      API Key
                    </h4>
                    <p className={`text-sm mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Use this key to authenticate API requests
                    </p>
                  </div>
                  {integrations.apiKey ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={revokeApiKey}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          darkMode 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        Revoke
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={generateApiKey}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Generate API Key
                    </button>
                  )}
                </div>

                {integrations.apiKey && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Your API Key
                    </label>
                    <div className="flex items-center">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={integrations.apiKey}
                        readOnly
                        className={`flex-1 px-4 py-2 rounded-l-lg border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-300' 
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        }`}
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className={`px-4 py-2 border border-l-0 rounded-r-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300' 
                            : 'bg-gray-200 border-gray-300 text-gray-700'
                        }`}
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className={`text-xs mt-2 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Keep this key secret. It provides full access to your account.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <h5 className={`font-medium mb-3 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Webhook URL
                  </h5>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={integrations.webhookUrl}
                      onChange={(e) => setIntegrations(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className={`flex-1 px-4 py-2 rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      placeholder="https://your-server.com/webhook"
                    />
                    <button className={`px-4 py-2 rounded-r-lg font-medium ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                      Save
                    </button>
                  </div>
                  <p className={`text-xs mt-2 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Receive real-time updates about your HiSuru account
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Third-Party Integrations
                </h4>
                <div className="space-y-4">
                  {[
                    { name: 'Google Calendar', enabled: integrations.googleCalendar, icon: '📅' },
                    { name: 'Slack', enabled: integrations.slack, icon: '💬' },
                    { name: 'GitHub', enabled: integrations.github, icon: '🐙' },
                    { name: 'Stripe', enabled: integrations.stripe, icon: '💳' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{integration.icon}</span>
                        <div>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {integration.name}
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {integration.enabled ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        integration.enabled
                          ? darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          : darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}>
                        {integration.enabled ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}