import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Group } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('authToken');
  const [editGroup, setEditGroup] = useState<{ id: string, name: string, description: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // @ts-ignore
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') as string));

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    if (!token) {
      setError('Token is missing');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/groups`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('User or Token is missing');
      return;
    }

    try {
      await axios.post(
          `${API_URL}/groups`,
          { ...newGroup },
          { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '' });
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
    }
  }

  async function handleEditGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!editGroup) return;
    try {
      await axios.put(`${API_URL}/groups/${editGroup.id}`, {
        name: editGroup.name,
        description: editGroup.description,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setShowEditModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group');
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (!window.confirm("Voulez-vous vraiment supprimer ce groupe ?")) return;
    try {
      await axios.delete(`${API_URL}/groups/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Failed to delete group');
    }
  }

  // Check if current user is the group owner
  const isGroupOwner = (group: Group) => {
    // @ts-ignore
    return currentUser && group.createdBy.id === currentUser.id;
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">Gaming Groups</h1>
          <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            Create Group
          </button>
        </div>

        {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <p>{error}</p>
            </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map((group) => (
              <div
                  key={group.id}
                  className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-700"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {group.name}
                      </h2>
                      <p className="text-white text-sm mb-4">{group.description}</p>
                    </div>
                    {/*// @ts-ignore*/}
                    {group.createdBy.avatarUrl && (
                        <img
                            /*// @ts-ignore*/
                            src={group.createdBy.avatarUrl}
                            /*// @ts-ignore*/
                            alt={`${group.createdBy.pseudo}'s avatar`}
                            className="w-10 h-10 rounded-full border-2 border-indigo-100"
                        />
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Link
                        to={`/groups/${group.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                    >
                      View Calendar
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>

                    {isGroupOwner(group) && (
                        <div className="flex space-x-2">
                          <button
                              onClick={() => {
                                setEditGroup(group);
                                setShowEditModal(true);
                              }}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-white flex justify-between">
                    {/*// @ts-ignore*/}
                    <span>Created by {group.createdBy.pseudo}</span>
                    {/*// @ts-ignore*/}
                    <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* Edit Modal - similar to previous implementation */}
        {showEditModal && editGroup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-7s00 rounded-lg p-8 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white">Edit Group</h2>
                <form onSubmit={handleEditGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white">Group Name</label>
                    <input
                        type="text"
                        value={editGroup.name}
                        /*// @ts-ignore*/
                        onChange={(e) => setEditGroup({description: "", id: "", ...editGroup, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white">Description</label>
                    <textarea
                        value={editGroup.description}
                        /*// @ts-ignore*/
                        onChange={(e) => setEditGroup({id: "", name: "", ...editGroup, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 text-white hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-700 rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-white">Create New Group</h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white">
                      Group Name
                    </label>
                    <input
                        type="text"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white">
                      Description
                    </label>
                    <textarea
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-white hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Create Group
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
