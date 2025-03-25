// @ts-ignore
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface InviteUserModalProps {
    groupId: string;
    onClose: () => void;
}

export default function InviteUserModal({ groupId, onClose }: InviteUserModalProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken');

    // Charger les utilisateurs disponibles
    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get(`${API_URL}/api/users/${groupId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
                setFilteredUsers(response.data); // Initialiser la liste filtrée
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Impossible de charger les utilisateurs.');
            }
        }
        fetchUsers();
    }, []);

    // Filtrer la liste des utilisateurs
    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.pseudo.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    // Fonction pour inviter un utilisateur
    const handleInvite = async () => {
        if (!selectedUser) {
            setError('Veuillez sélectionner un utilisateur.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.post(
                `${API_URL}/groups/${groupId}/invite`,
                { userId: selectedUser.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(`Invitation envoyée à ${selectedUser.pseudo} !`);
            setSearchTerm('');
            setSelectedUser(null);
        } catch (error) {
            console.error('Error inviting user:', error);
            setError('Échec de l\'invitation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Inviter un membre</h2>

                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}

                {/* Champ de recherche */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {/* Liste déroulante */}
                    {filteredUsers.length > 0 && searchTerm && (
                        <ul className="absolute top-12 left-0 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                            {filteredUsers.map((user) => (
                                <li
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setSearchTerm(user.pseudo);
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {user.pseudo}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={loading || !selectedUser}
                        className={`px-4 py-2 text-white rounded ${loading ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {loading ? 'Envoi...' : 'Inviter'}
                    </button>
                </div>
            </div>
        </div>
    );
}
