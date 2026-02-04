import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Star,
  Shield,
  Crown,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ExternalLink,
  Download,
  Upload,
  Settings,
  Bell,
  Video,
  FileText,
  Share2,
  Lock,
  Globe,
  UserCheck,
  UserX,
  Plus,
  Loader2,
  AlertCircle,
  Check,
  Copy
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast, Toaster } from 'react-hot-toast';

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    emails: '',
    role: 'member',
    teamId: '',
    name: ''
  });
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    description: '',
    visibility: 'private'
  });
  const [currentUser, setCurrentUser] = useState(null);

  // Stats calculation
  const activeMembers = members.filter(m => m.status === 'active').length;
  const pendingMembers = members.filter(m => m.status === 'pending').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;
  
  const teamStats = [
    { label: 'Total Teams', value: teams.length.toString(), change: '', icon: Users, color: 'blue' },
    { label: 'Active Members', value: activeMembers.toString(), change: '', icon: UserCheck, color: 'green' },
    { label: 'Pending Invites', value: invitations.length.toString(), change: '', icon: Clock, color: 'yellow' },
    { label: 'Inactive', value: inactiveMembers.toString(), change: '', icon: UserX, color: 'red' },
  ];

  const roles = [
    { value: 'owner', label: 'Owner', icon: Crown, color: 'yellow', description: 'Full access' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'purple', description: 'Manage team' },
    { value: 'member', label: 'Member', icon: Users, color: 'blue', description: 'Standard access' },
    { value: 'viewer', label: 'Viewer', icon: Eye, color: 'gray', description: 'View only' },
  ];

  // Fetch current user and data
  useEffect(() => {
    fetchCurrentUser();
    fetchTeams();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeams(data || []);
      
      // Fetch members and invitations for each team
      if (data && data.length > 0) {
        await Promise.all([
          fetchTeamMembers(data[0]?.id),
          fetchTeamInvitations(data[0]?.id)
        ]);
        
        // Set first team as default for invite form
        if (data[0]) {
          setInviteForm(prev => ({ ...prev, teamId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          teams:team_id (
            name
          )
        `)
        .eq('team_id', teamId);
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchTeamInvitations = async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  // Handle team selection change
  const handleTeamSelect = (teamId) => {
    setInviteForm(prev => ({ ...prev, teamId }));
    fetchTeamMembers(teamId);
    fetchTeamInvitations(teamId);
  };

  // Generate invitation token
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Send invitation email via Supabase SMTP
 // Updated sendInvitationEmail function (use this one)
const sendInvitationEmail = async (email, token, teamName, role, invitedByName) => {
  try {
    // Check if we're using Supabase v1 or v2
    const supabaseVersion = supabase.auth['admin'] ? 'v2' : 'v1';
    
    if (supabaseVersion === 'v2') {
      // For Supabase v2, we need to use a different approach
      // Create an invitation link for the user
      const inviteLink = `${window.location.origin}/join-team?token=${token}&email=${encodeURIComponent(email)}&team=${teamName}&role=${role}`;
      
      // For now, we'll just show the link and let the admin copy it
      // In production, you'd want to set up an email service
      
      console.log('Invitation link for', email, ':', inviteLink);
      
      // Show toast with copyable link
      toast.custom((t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Invitation Created</h3>
            <button 
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Send this invitation link to <span className="font-medium">{email}</span>:
          </p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-gray-100 rounded p-2 text-sm font-mono overflow-x-auto">
              {inviteLink}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success('Link copied to clipboard!');
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            The user can use this link to join the team after signing up.
          </p>
        </div>
      ), { duration: 10000 });
      
      return true; // Consider it successful since we have the link
      
    } else {
      // For Supabase v1 (deprecated)
      const { error } = await supabase.auth.api.inviteUserByEmail(email, {
        data: {
          team_name: teamName,
          role: role,
          invited_by: invitedByName,
          token: token
        },
        redirectTo: `${window.location.origin}/accept-invite?token=${token}`
      });
      
      if (error) throw error;
      return true;
    }
    
  } catch (error) {
    console.error('Email invitation error:', error);
    
    // Even if email fails, we still have the invitation in database
    // User can accept via token
    const fallbackLink = `${window.location.origin}/accept-invite?token=${token}`;
    console.log('Fallback invitation link:', fallbackLink);
    
    toast.error(`Email failed. Use this link: ${fallbackLink}`, {
      duration: 10000
    });
    
    return false;
  }
};

  // Handle invite submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteForm.emails.trim() || !inviteForm.teamId) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsInviting(true);
    
    const emails = inviteForm.emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email);
    
    const team = teams.find(t => t.id === inviteForm.teamId);
    
    if (!team) {
      toast.error('Selected team not found');
      setIsInviting(false);
      return;
    }

    const invitedByName = currentUser?.user_metadata?.full_name || 'Team Admin';
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const email of emails) {
      try {
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        
        // 1. Create invitation record
        const { error: inviteError } = await supabase
          .from('team_invitations')
          .insert([{
            team_id: inviteForm.teamId,
            email: email,
            role: inviteForm.role,
            status: 'pending',
            token: token,
            expires_at: expiresAt.toISOString(),
            created_by: currentUser?.id,
            name: inviteForm.name || email.split('@')[0]
          }]);
        
        if (inviteError) throw inviteError;
        
        // 2. Send invitation email
        await sendInvitationEmail(
          email, 
          token, 
          team.name, 
          inviteForm.role,
          invitedByName
        );
        
        successCount++;
        
        // 3. Create pending member record
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{
            team_id: inviteForm.teamId,
            email: email,
            role: inviteForm.role,
            status: 'pending',
            invited_at: new Date().toISOString(),
            created_by: currentUser?.id,
            name: inviteForm.name || email.split('@')[0]
          }]);
        
        if (memberError) throw memberError;
        
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error);
        errorCount++;
      }
    }
    
    setIsInviting(false);
    setShowInviteModal(false);
    
    // Reset form
    setInviteForm({
      emails: '',
      role: 'member',
      teamId: teams[0]?.id || '',
      name: ''
    });
    
    // Refresh data
    await fetchTeamInvitations(inviteForm.teamId);
    await fetchTeamMembers(inviteForm.teamId);
    
    // Show results
    if (successCount > 0) {
      toast.success(`Successfully sent ${successCount} invitation(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to send ${errorCount} invitation(s)`);
    }
  };

  // Handle team creation
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (!createTeamForm.name.trim()) {
      toast.error('Team name is required');
      return;
    }
    
    setIsCreatingTeam(true);
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: createTeamForm.name,
          description: createTeamForm.description,
          owner_id: currentUser?.id,
          status: 'active',
          visibility: createTeamForm.visibility,
          member_count: 1
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add creator as owner member
      await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: currentUser?.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString(),
          created_by: currentUser?.id,
          name: currentUser?.user_metadata?.full_name || 'Team Owner'
        }]);
      
      toast.success('Team created successfully!');
      setShowCreateTeamModal(false);
      
      // Reset form
      setCreateTeamForm({
        name: '',
        description: '',
        visibility: 'private'
      });
      
      // Refresh teams list
      await fetchTeams();
      
    } catch (error) {
      console.error('Team creation error:', error);
      toast.error('Failed to create team');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Handle resend invitation
  const handleResendInvitation = async (invitationId) => {
    try {
      const invitation = invitations.find(i => i.id === invitationId);
      if (!invitation) return;
      
      const team = teams.find(t => t.id === invitation.team_id);
      const invitedByName = currentUser?.user_metadata?.full_name || 'Team Admin';
      
      // Send email
      await sendInvitationEmail(
        invitation.email,
        invitation.token,
        team?.name || 'Team',
        invitation.role,
        invitedByName
      );
      
      toast.success('Invitation resent successfully');
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend invitation');
    }
  };

  // Handle cancel invitation
  const handleCancelInvitation = async (invitationId) => {
    try {
      const invitation = invitations.find(i => i.id === invitationId);
      if (!invitation) return;
      
      // Update invitation status
      const { error: inviteError } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);
      
      if (inviteError) throw inviteError;
      
      // Remove pending member record
      await supabase
        .from('team_members')
        .delete()
        .eq('email', invitation.email)
        .eq('team_id', invitation.team_id)
        .eq('status', 'pending');
      
      // Refresh data
      await fetchTeamInvitations(invitation.team_id);
      await fetchTeamMembers(invitation.team_id);
      
      toast.success('Invitation cancelled');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  // Handle member role update
  const handleUpdateRole = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);
      
      if (error) throw error;
      
      // Update local state
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Role update error:', error);
      toast.error('Failed to update role');
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberId, memberEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      // Update local state
      setMembers(members.filter(member => member.id !== memberId));
      
      // Update team member count
      const teamId = members.find(m => m.id === memberId)?.team_id;
      if (teamId) {
        await supabase.rpc('decrement_team_member_count', { team_id: teamId });
        await fetchTeams();
      }
      
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Remove member error:', error);
      toast.error('Failed to remove member');
    }
  };

  // Filter members based on active tab and search term
  const filteredMembers = members.filter(member => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return member.status === 'active';
    if (activeTab === 'pending') return member.status === 'pending';
    if (activeTab === 'inactive') return member.status === 'inactive';
    return true;
  }).filter(member => 
    (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">Manage team members, roles, and collaboration settings</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowInviteModal(true)}
            disabled={teams.length === 0}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Members
          </button>
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Team
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <div className="flex items-baseline mt-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <span className={`ml-2 text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teams Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Teams</h2>
          <button 
            onClick={fetchTeams}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            Refresh <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {teams.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-6">Create your first team to start collaborating</p>
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-600">{team.member_count || 0} members</p>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{team.description || 'No description provided'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        team.visibility === 'public' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {team.visibility}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        team.status === 'active' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {team.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleTeamSelect(team.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        inviteForm.teamId === team.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {inviteForm.teamId === team.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex justify-between">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View Team
                    </button>
                    <div className="flex space-x-3">
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded">
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Team Card */}
            <div 
              onClick={() => setShowCreateTeamModal(true)}
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Create New Team</h3>
              <p className="text-gray-600 text-sm text-center">
                Start a new team for different projects or departments
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {['all', 'active', 'pending', 'inactive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          <div className="flex items-center space-x-3">
            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No team members found</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const RoleIcon = roles.find(r => r.value === member.role)?.icon || Users;
                  const roleColor = roles.find(r => r.value === member.role)?.color || 'gray';
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {member.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {member.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium bg-${roleColor}-100 text-${roleColor}-700 border-0 focus:ring-2 focus:ring-${roleColor}-500`}
                          disabled={member.role === 'owner' || !currentUser?.id}
                        >
                          {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {member.status === 'active' && (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-green-700 font-medium">Active</span>
                            </>
                          )}
                          {member.status === 'pending' && (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                              <span className="text-yellow-700 font-medium">Pending</span>
                            </>
                          )}
                          {member.status === 'inactive' && (
                            <>
                              <XCircle className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-red-700 font-medium">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {member.joined_at 
                          ? new Date(member.joined_at).toLocaleDateString()
                          : 'Not joined'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleRemoveMember(member.id, member.email)}
                            disabled={member.role === 'owner'}
                            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={member.role === 'owner' ? "Cannot remove team owner" : "Remove member"}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded">
                            <Mail className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-yellow-900">Pending Invitations ({invitations.length})</h3>
            </div>
            <button 
              onClick={() => fetchTeamInvitations(inviteForm.teamId)}
              className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-3">
            {invitations.map((invite) => (
              <div key={invite.id} className="bg-white rounded-lg p-4 border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-600">
                      Invited as {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleResendInvitation(invite.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg hover:bg-green-200 flex items-center"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Resend
                    </button>
                    <button 
                      onClick={() => handleCancelInvitation(invite.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-lg hover:bg-red-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Invite Team Members</h3>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={isInviting}
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleInviteSubmit}>
                <div className="space-y-4">
                  {teams.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Team
                      </label>
                      <select
                        value={inviteForm.teamId}
                        onChange={(e) => setInviteForm({...inviteForm, teamId: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isInviting}
                      >
                        <option value="">Select a team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Addresses *
                    </label>
                    <textarea
                      value={inviteForm.emails}
                      onChange={(e) => setInviteForm({...inviteForm, emails: e.target.value})}
                      placeholder="john@example.com, jane@company.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                      disabled={isInviting}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate multiple emails with commas
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                      placeholder="Display name for the invitee"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isInviting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isInviting}
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    disabled={isInviting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={isInviting}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Invites'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Team</h3>
                <button 
                  onClick={() => setShowCreateTeamModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={isCreatingTeam}
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateTeam}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={createTeamForm.name}
                      onChange={(e) => setCreateTeamForm({...createTeamForm, name: e.target.value})}
                      placeholder="e.g., Marketing Team, Development"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isCreatingTeam}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={createTeamForm.description}
                      onChange={(e) => setCreateTeamForm({...createTeamForm, description: e.target.value})}
                      placeholder="Brief description of the team's purpose"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      disabled={isCreatingTeam}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCreateTeamForm({...createTeamForm, visibility: 'public'})}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          createTeamForm.visibility === 'public' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={isCreatingTeam}
                      >
                        <Globe className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-gray-600">Anyone can join</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateTeamForm({...createTeamForm, visibility: 'private'})}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          createTeamForm.visibility === 'private' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={isCreatingTeam}
                      >
                        <Lock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                        <p className="font-medium">Private</p>
                        <p className="text-xs text-gray-600">Invite only</p>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeamModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    disabled={isCreatingTeam}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={isCreatingTeam}
                  >
                    {isCreatingTeam ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Team'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}