import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader, Shield, Users } from 'lucide-react';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchInvitation();
    } else {
      setError('Invalid invitation link');
      setLoading(false);
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          teams:team_id (name, description, owner_id),
          inviter:created_by (email, full_name)
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error) throw error;

      if (!data) {
        setError('Invitation not found or has expired');
      } else if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
      } else {
        setInvitation(data);
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Invalid invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation) return;
    
    setAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not logged in, redirect to signup with invitation token
        navigate(`/auth?mode=signup&invitation_token=${token}`);
        return;
      }

      // Check if user already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', invitation.team_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setError('You are already a member of this team');
        return;
      }

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
          status: 'active',
          joined_at: new Date().toISOString(),
          created_by: invitation.created_by,
          email: user.email,
          name: user.user_metadata?.full_name || user.email
        }]);

      if (memberError) throw memberError;

      // Update invitation status
      await supabase
        .from('team_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Redirect to team page
      navigate(`/teams/${invitation.team_id}`);
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Invitation</h1>
            <p className="text-gray-600">You've been invited to join a team</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{invitation.teams.name}</h3>
                  <p className="text-sm text-gray-600">{invitation.teams.description || 'No description'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Invited by:</span>
                <span className="font-medium text-gray-900">
                  {invitation.inviter?.full_name || invitation.inviter?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium text-gray-900 capitalize">{invitation.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium text-gray-900">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {accepting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Accept Invitation
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Decline
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            By accepting, you'll gain access to the team's workspace and resources.
          </p>
        </div>
      </div>
    </div>
  );
}