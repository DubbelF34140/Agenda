import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {patch, post} from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserProfile() {
    const [userData, setUserData] = useState({
        id: '',
        pseudo: '',
        password: '',
        avatarUrl: '',
    });
    const [newPseudo, setNewPseudo] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch the current user details
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/user`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch user data');

                setUserData({
                    id: data.id,
                    pseudo: data.pseudo,
                    password: '', // Don't display password
                    avatarUrl: data.avatarUrl,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to upload image');

            return data.imageUrl; // Return the uploaded image URL
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) return;
        const avatarUrl = newAvatar ? await handleImageUpload(newAvatar) : userData.avatarUrl;

        try {
            const response = await fetch(`${API_URL}/api/user/${userData.id}`, {
                method: 'POST', // Use POST instead of PATCH
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pseudo: newPseudo || userData.pseudo,
                    password: newPassword,
                    avatarUrl: avatarUrl,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update user data');

            setUserData({
                id: data.id,
                pseudo: data.pseudo,
                avatarUrl: data.avatarUrl,
                password: '', // Don't store password in state for security reasons
            });

            alert('Profile updated successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Update Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700">
                        Pseudo
                    </label>
                    <input
                        id="pseudo"
                        type="text"
                        value={newPseudo || userData.pseudo}
                        onChange={(e) => setNewPseudo(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                        Avatar
                    </label>
                    <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewAvatar(e.target.files ? e.target.files[0] : null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {userData.avatarUrl && (
                        <img src={userData.avatarUrl} alt="Current Avatar" className="mt-2 w-16 h-16 rounded-full" />
                    )}
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
