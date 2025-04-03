import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {UserIcon} from "@heroicons/react/16/solid";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');

export default function Games() {
    const [games, setGames] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [newGame, setNewGame] = useState({ name: '', description: '',avatarUrl : '', settings: [], playersettings: [] });
    const [newAvatar, setNewAvatar] = useState<File | null>(null);



    useEffect(() => {
        fetchGames();
    }, []);

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
        }
    };

    async function fetchGames() {
        try {
            const response = await axios.get(`${API_URL}/games`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setGames(response.data);
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    }

    async function handleCreateGame(e) {
        e.preventDefault();
        const avatarUrl = newGame ? await handleImageUpload(newAvatar) : newGame.avatarUrl;
        newGame.avatarUrl = avatarUrl;
        try {
            await axios.post(`${API_URL}/games`, newGame, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setShowCreateModal(false);
            setNewGame({ name: '', description: '', avatarUrl : '', settings: [], playersettings: [] });
            fetchGames();
        } catch (error) {
            console.error('Error creating game:', error);
        }
    }

    function addSetting() {
        setNewGame({
            ...newGame,
            settings: [...newGame.settings, { key: '', valueType: 'STRING', defaultValue: '' }],
        });
    }
    function addPlayerSetting() {
        setNewGame({
            ...newGame,
            playersettings: [...newGame.playersettings, { key: '', valueType: 'STRING', defaultValue: '' }],
        });
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900">🎮 Games List</h1>
                <button onClick={() => setShowCreateModal(true)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg">
                    ➕ Add Game
                </button>
            </div>

            {/* 🎮 Liste des jeux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <div
                        key={game.id}
                        className="border rounded-xl p-5 shadow-lg bg-white hover:shadow-xl transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h2>
                                <p className="text-gray-600 mb-3 line-clamp-2">{game.description}</p>
                            </div>
                            <div className="ml-4">
                                {game.avatarUrl ? (
                                    <img
                                        src={game.avatarUrl}
                                        alt={game.name}
                                        className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover shadow-sm"
                                    />
                                ) : (
                                    <UserIcon
                                        className="w-12 h-12 p-2 bg-gray-100 rounded-full text-gray-500 shadow-sm"/>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedGame(game)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-full md:w-auto"
                        >
                            <span>Voir les détails</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* 📌 Modale de création d'un jeu */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">Créer un nouveau jeu</h2>
                        <form onSubmit={handleCreateGame} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom du jeu</label>
                                <input
                                    type="text"
                                    value={newGame.name}
                                    onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                                    className="mt-1 block w-full border rounded-md p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={newGame.description}
                                    onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                                    className="mt-1 block w-full border rounded-md p-2"
                                    rows={3}
                                    required
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
                                {newGame.avatarUrl && (
                                    <img src={newGame.avatarUrl} alt="Current Avatar"
                                         className="mt-2 w-16 h-16 rounded-full"/>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Paramètres</label>
                                {newGame.settings.map((setting, index) => (
                                    <div key={index} className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Clé"
                                            value={setting.key}
                                            onChange={(e) => {
                                                const updatedSettings = [...newGame.settings];
                                                updatedSettings[index].key = e.target.value;
                                                setNewGame({...newGame, settings: updatedSettings});
                                            }}
                                            className="border rounded-md p-2 w-1/3"
                                        />
                                        <select
                                            value={setting.valueType}
                                            onChange={(e) => {
                                                const updatedSettings = [...newGame.settings];
                                                updatedSettings[index].valueType = e.target.value;
                                                setNewGame({...newGame, settings: updatedSettings});
                                            }}
                                            className="border rounded-md p-2 w-1/3"
                                        >
                                            <option value="STRING">String</option>
                                            <option value="INTEGER">Integer</option>
                                            <option value="BOOLEAN">Boolean</option>
                                            <option value="LIST">List</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Valeur par défaut"
                                            value={setting.defaultValue}
                                            onChange={(e) => {
                                                const updatedSettings = [...newGame.settings];
                                                updatedSettings[index].defaultValue = e.target.value;
                                                setNewGame({...newGame, settings: updatedSettings});
                                            }}
                                            className="border rounded-md p-2 w-1/3"
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={addSetting} className="text-blue-600">
                                    + Ajouter un paramètre
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Paramètres des
                                    joueurs</label>
                                {newGame.playersettings.map((setting, index) => (
                                    <div key={index} className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Clé"
                                            value={setting.key}
                                            onChange={(e) => {
                                                const updatedSettings = [...newGame.playersettings];
                                                updatedSettings[index].key = e.target.value;
                                                setNewGame({...newGame, playersettings: updatedSettings});
                                            }}
                                            className="border rounded-md p-2 w-1/3"
                                        />
                                        <select
                                            value={setting.valueType}
                                            onChange={(e) => {
                                                const updatedSettings = [...newGame.playersettings];
                                                updatedSettings[index].valueType = e.target.value;
                                                setNewGame({...newGame, playersettings: updatedSettings});
                                            }}
                                            className="border rounded-md p-2 w-1/3"
                                        >
                                            <option value="STRING">String</option>
                                            <option value="INTEGER">Integer</option>
                                            <option value="BOOLEAN">Boolean</option>
                                            <option value="LIST">List</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Valeur par défaut"
                                            value={setting.defaultValue}
                                            onChange={(e) => {
                                                const updatedSettings = [...newGame.playersettings];
                                                updatedSettings[index].defaultValue = e.target.value;
                                                setNewGame({...newGame, playersettings: updatedSettings});
                                            }}
                                            className="border rounded-md p-2 w-1/3"
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={addPlayerSetting} className="text-blue-600">
                                    + Ajouter un paramètre de joueur
                                </button>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                                Créer
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔍 Modale des détails du jeu */}
            {selectedGame && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">{selectedGame.name}</h2>
                        <p className="text-gray-600 mb-4">{selectedGame.description}</p>
                        <h3 className="text-lg font-semibold mb-2">🎛 Paramètres</h3>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-2 py-1">Clé</th>
                                <th className="border border-gray-300 px-2 py-1">Type</th>
                                <th className="border border-gray-300 px-2 py-1">Valeur par défaut</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedGame.settings.map((setting) => (
                                <tr key={setting.id} className="border border-gray-300">
                                    <td className="border px-2 py-1">{setting.key}</td>
                                    <td className="border px-2 py-1">{setting.valueType}</td>
                                    <td className="border px-2 py-1">{setting.defaultValue}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <h3 className="text-lg font-semibold mb-2">🎛 Paramètres des joueurs</h3>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-2 py-1">Clé</th>
                                <th className="border border-gray-300 px-2 py-1">Type</th>
                                <th className="border border-gray-300 px-2 py-1">Valeur par défaut</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedGame.playersettings.map((setting) => (
                                <tr key={setting.id} className="border border-gray-300">
                                    <td className="border px-2 py-1">{setting.key}</td>
                                    <td className="border px-2 py-1">{setting.valueType}</td>
                                    <td className="border px-2 py-1">{setting.defaultValue}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <button onClick={() => setSelectedGame(null)}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md">
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
