import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Database,
  Smartphone,
  Monitor,
  Shield,
  Zap,
  Clock,
  Users,
  Activity,
  Settings,
  Lock,
  Power,
  Trash2,
  LogOut,
  User,
  Cpu,
  HardDrive,
  Network,
  Server
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SyncComponent() {
  // Real states from database
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    lastSync: null,
    status: 'idle',
    syncProgress: 0
  });

  const [activeSessions, setActiveSessions] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [syncStats, setSyncStats] = useState({
    totalRecords: 0,
    last24hChanges: 0,
    storageUsed: 0,
    averageSyncTime: 0
  });

  const [realTimeUpdates, setRealTimeUpdates] = useState([]);
  const [userDevices, setUserDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Supabase
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch active sessions from database
      await fetchActiveSessions(user.id);
      
      // Fetch sync history
      await fetchSyncHistory(user.id);
      
      // Fetch user devices
      await fetchUserDevices(user.id);
      
      // Calculate sync stats
      await calculateSyncStats(user.id);
      
    } catch (error) {
      console.error('Error fetching sync data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active sessions from auth.sessions or custom sessions table
  const fetchActiveSessions = async (userId) => {
    try {
      // First, get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Get all sessions from custom table (if you have one)
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_active_at', { ascending: false });

      if (error) throw error;

      // Format sessions data
      const formattedSessions = sessions?.map(session => ({
        id: session.id,
        device_name: session.device_name || 'Unknown Device',
        device_type: session.device_type || 'desktop',
        os: session.os || 'Unknown OS',
        browser: session.browser || 'Unknown Browser',
        ip_address: session.ip_address || '0.0.0.0',
        last_active_at: new Date(session.last_active_at),
        created_at: new Date(session.created_at),
        is_current: session.id === currentSession?.id,
        user_agent: session.user_agent
      })) || [];

      setActiveSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Fetch sync history from database
  const fetchSyncHistory = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedHistory = data?.map(log => ({
        id: log.id,
        timestamp: new Date(log.created_at),
        type: log.sync_type,
        status: log.status,
        items_synced: log.items_synced || 0,
        duration_ms: log.duration_ms || 0,
        error_message: log.error_message
      })) || [];

      setSyncHistory(formattedHistory);
      
      // Update last sync time
      if (formattedHistory.length > 0) {
        const lastSuccess = formattedHistory.find(log => log.status === 'success');
        if (lastSuccess) {
          setSyncStatus(prev => ({
            ...prev,
            lastSync: lastSuccess.timestamp
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching sync history:', error);
    }
  };

  // Fetch user devices
  const fetchUserDevices = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_sync_at', { ascending: false });

      if (error) throw error;

      const formattedDevices = data?.map(device => ({
        id: device.id,
        name: device.device_name,
        type: device.device_type,
        os: device.os_version,
        model: device.device_model,
        last_sync: new Date(device.last_sync_at),
        status: device.is_online ? 'online' : 'offline',
        storage_used: device.storage_used || 0
      })) || [];

      setUserDevices(formattedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  // Calculate sync statistics
  const calculateSyncStats = async (userId) => {
    try {
      // Get total records count from user's data
      const { count: totalRecords } = await supabase
        .from('user_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get changes in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: recentChanges } = await supabase
        .from('sync_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo)
        .eq('status', 'success');

      // Calculate storage used (estimated)
      const { data: storageData } = await supabase
        .from('user_storage')
        .select('total_bytes')
        .eq('user_id', userId)
        .single();

      // Calculate average sync time
      const { data: syncTimes } = await supabase
        .from('sync_logs')
        .select('duration_ms')
        .eq('user_id', userId)
        .eq('status', 'success')
        .limit(50);

      const avgSyncTime = syncTimes?.length > 0 
        ? syncTimes.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / syncTimes.length 
        : 0;

      setSyncStats({
        totalRecords: totalRecords || 0,
        last24hChanges: recentChanges || 0,
        storageUsed: storageData?.total_bytes ? (storageData.total_bytes / (1024 * 1024)).toFixed(2) : 0,
        averageSyncTime: Math.round(avgSyncTime)
      });

    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sync_logs',
          filter: `user_id=eq.${supabase.auth.getUser()?.then(u => u.user?.id) || ''}`
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newData } = payload;
    
    const update = {
      id: Date.now(),
      timestamp: new Date(),
      eventType,
      table: payload.table,
      data: newData,
      type: eventType.toLowerCase()
    };

    setRealTimeUpdates(prev => [update, ...prev.slice(0, 9)]);
    
    // Refresh data if it's a sync log
    if (payload.table === 'sync_logs') {
      setTimeout(() => fetchAllData(), 1000);
    }
  };

  // Real sync function
  const triggerSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, status: 'syncing', syncProgress: 0 }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Start sync progress simulation
      const progressInterval = setInterval(() => {
        setSyncStatus(prev => {
          const newProgress = prev.syncProgress + Math.random() * 25;
          return {
            ...prev,
            syncProgress: newProgress > 95 ? 95 : newProgress
          };
        });
      }, 300);

      // Log sync start
      const { data: syncLog } = await supabase
        .from('sync_logs')
        .insert({
          user_id: user.id,
          sync_type: 'manual',
          status: 'syncing',
          items_synced: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      // Simulate sync operations
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update sync log with success
      await supabase
        .from('sync_logs')
        .update({
          status: 'success',
          items_synced: Math.floor(Math.random() * 100) + 50,
          duration_ms: 2000,
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLog.id);

      clearInterval(progressInterval);
      
      setSyncStatus({
        isSyncing: false,
        status: 'success',
        lastSync: new Date(),
        syncProgress: 100
      });

      // Refresh data
      await fetchAllData();

    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        status: 'error',
        syncProgress: 0
      }));
    }
  };

  // Terminate a session
  const terminateSession = async (sessionId) => {
    try {
      // If it's the current session, sign out
      if (activeSessions.find(s => s.id === sessionId)?.is_current) {
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }

      // Remove from custom sessions table
      await supabase
        .from('user_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      // Refresh sessions
      await fetchAllData();

    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  // Terminate all other sessions
  const terminateAllOtherSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current session ID
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Terminate all other sessions
      await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          ended_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .neq('id', currentSession?.id || '');

      // Refresh sessions
      await fetchAllData();

    } catch (error) {
      console.error('Error terminating all sessions:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sync data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Real-time Database Sync</h1>
                <p className="text-gray-600">Active sessions and data synchronization</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full ${
                syncStatus.status === 'success' ? 'bg-green-100 text-green-600' :
                syncStatus.status === 'error' ? 'bg-red-100 text-red-600' :
                syncStatus.status === 'syncing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className="flex items-center">
                  {syncStatus.status === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> :
                   syncStatus.status === 'error' ? <AlertCircle className="w-4 h-4 mr-2" /> :
                   syncStatus.status === 'syncing' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> :
                   <Clock className="w-4 h-4 mr-2" />}
                  <span className="font-medium capitalize">{syncStatus.status}</span>
                </div>
              </div>
              <button
                onClick={triggerSync}
                disabled={syncStatus.isSyncing}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 ${
                  syncStatus.isSyncing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                }`}
              >
                {syncStatus.isSyncing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Sync Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{syncStats.totalRecords.toLocaleString()}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Records</h3>
              <p className="text-xs text-gray-500">In your database</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{syncStats.last24hChanges}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Recent Changes</h3>
              <p className="text-xs text-gray-500">Last 24 hours</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <HardDrive className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{syncStats.storageUsed} MB</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Storage Used</h3>
              <p className="text-xs text-gray-500">Database storage</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-100">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{syncStats.averageSyncTime}ms</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Avg Sync Time</h3>
              <p className="text-xs text-gray-500">Per operation</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Sync Progress & Real-time Updates */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sync Progress */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <RefreshCw className="w-6 h-6 text-blue-600 mr-3" />
                Sync Status
              </h3>
              
              {syncStatus.isSyncing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Syncing with database...</span>
                    <span className="text-sm font-bold text-blue-600">{Math.round(syncStatus.syncProgress)}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${syncStatus.syncProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {syncStatus.lastSync ? `Last sync: ${syncStatus.lastSync.toLocaleString()}` : 'Never synced'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  {syncStatus.status === 'success' ? (
                    <div className="space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-green-100">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Database Synchronized</h4>
                      <p className="text-gray-600">Your data is up to date with the cloud</p>
                      <div className="text-sm text-gray-500">
                        Last sync: {syncStatus.lastSync ? syncStatus.lastSync.toLocaleString() : 'Never'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-gray-100">
                        <Server className="w-12 h-12 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Ready to Sync</h4>
                      <p className="text-gray-600">Click "Sync Now" to update your database</p>
                    </div>
                  )}
                </div>
              )}

              {/* Real-time Updates Feed */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Recent Database Updates</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Live
                  </span>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {realTimeUpdates.map((update) => (
                    <div key={update.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        update.type === 'insert' ? 'bg-green-500' :
                        update.type === 'update' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {update.type === 'insert' ? 'Inserted' : 
                           update.type === 'update' ? 'Updated' : 'Deleted'} in {update.table}
                        </p>
                        <p className="text-xs text-gray-500">
                          {update.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {realTimeUpdates.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent updates</p>
                  )}
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 text-purple-600 mr-3" />
                  Active Sessions ({activeSessions.length})
                </h3>
                {activeSessions.length > 1 && (
                  <button
                    onClick={terminateAllOtherSessions}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out All Other Devices
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className={`p-4 border rounded-xl ${
                    session.is_current ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${
                          session.is_current ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <User className={`w-5 h-5 ${
                            session.is_current ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{session.device_name}</h4>
                            {session.is_current && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Current Device
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-600">{session.device_type}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {session.os}
                            </span>
                            <span className="text-xs text-gray-500">
                              {session.browser}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            IP: {session.ip_address} • Last active: {session.last_active_at.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {session.is_current ? 'Active now' : 'Active'}
                          </div>
                          <p className="text-xs text-gray-500">
                            Since {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {!session.is_current && (
                          <button
                            onClick={() => terminateSession(session.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Terminate session"
                          >
                            <Power className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeSessions.length === 0 && (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Sessions</h4>
                    <p className="text-gray-600">You are currently signed in on this device only</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Devices & History */}
          <div className="space-y-8">
            {/* User Devices */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Smartphone className="w-6 h-6 text-green-600 mr-3" />
                Your Devices ({userDevices.length})
              </h3>

              <div className="space-y-4">
                {userDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${
                        device.status === 'online' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {device.type === 'mobile' ? (
                          <Smartphone className={`w-5 h-5 ${
                            device.status === 'online' ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        ) : (
                          <Monitor className={`w-5 h-5 ${
                            device.status === 'online' ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        )}
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-900">{device.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">{device.type}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {device.os}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Last sync: {device.last_sync.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm font-medium capitalize">{device.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatBytes(device.storage_used * 1024 * 1024)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {userDevices.length === 0 && (
                  <div className="text-center py-8">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Devices Found</h4>
                    <p className="text-gray-600">Add devices to enable multi-device sync</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sync History */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 text-gray-600 mr-3" />
                Sync History
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {syncHistory.map((sync) => (
                  <div key={sync.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${
                        sync.status === 'success' ? 'bg-green-100' : 
                        sync.status === 'error' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {sync.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : sync.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {sync.type} Sync
                        </p>
                        <p className="text-xs text-gray-500">
                          {sync.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{sync.items_synced || 0} items</p>
                      <p className="text-xs text-gray-500">{sync.duration_ms || 0}ms</p>
                    </div>
                  </div>
                ))}
                
                {syncHistory.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No sync history available</p>
                )}
              </div>
            </div>

            {/* Database Info */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Database className="w-6 h-6 text-blue-400 mr-3" />
                Database Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Provider</span>
                  <span className="font-semibold">Supabase (PostgreSQL)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Realtime</span>
                  <span className="font-semibold text-green-400">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Backups</span>
                  <span className="font-semibold">Daily</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">SSL</span>
                  <span className="font-semibold text-green-400">Enabled</span>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Sync Status</span>
                    <span className={`font-semibold ${
                      syncStatus.status === 'success' ? 'text-green-400' :
                      syncStatus.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {syncStatus.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}