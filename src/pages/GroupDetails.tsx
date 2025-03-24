import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserPlus, Calendar, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Group, GroupMember, User } from '../types';

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<(GroupMember & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchGroupDetails();
    fetchCurrentUser();
  }, [id]);

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(data);
    }
  }

  async function fetchGroupDetails() {
    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Fetch members with user details
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('group_id', id);

      if (membersError) throw membersError;
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    try {
      // First find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (userError) throw new Error('User not found');

      // Add user to group members
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: id,
          user_id: userData.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      setShowInviteModal(false);
      setInviteEmail('');
      fetchGroupDetails();
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', userId);

      if (error) throw error;
      fetchGroupDetails();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const isAdmin = members.some(m => 
    m.user_id === currentUser?.id && m.role === 'admin'
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
            <p className="text-gray-600">{group.description}</p>
            <p className="text-sm text-gray-500 mt-2">Game: {group.game}</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to={`/groups/${id}/calendar`}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Link>
            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Members</h2>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.role}
                    </p>
                  </div>
                </div>
                {isAdmin && member.user_id !== currentUser?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Invite Member</h2>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}