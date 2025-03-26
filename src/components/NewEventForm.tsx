import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');

export default function NewEventForm({ onClose, onEventCreated, datestartTime }) {
    const { id } = useParams<{ id: string }>();
    const date = new Date(datestartTime);
    const formattedDate = `${date.toISOString().slice(0, 16)}`;
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        color: '',
        startTime: formattedDate,  // Use the passed date as default value
        endTime: '',
        gameId: '',
        groupId: id,
        settings: []
    });
    const [games, setGames] = useState([]);



    useEffect(() => {
        fetchGames();
    }, []);

    // Fonction pour récupérer les jeux
    async function fetchGames() {
        try {
            const response = await axios.get(`${API_URL}/games`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setGames(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux :', error);
        }
    }

    // Gérer le changement de sélection du jeu
    function handleGameChange(gameId) {
        setEventData({ ...eventData, gameId, settings: [] });

        // Charger les paramètres par défaut pour le jeu sélectionné
        const selectedGame = games.find(game => game.id === gameId);
        if (selectedGame) {
            const defaultSettings = selectedGame.settings.map((setting) => ({
                key: setting.key,
                value: setting.defaultValue || '',
                valueType: setting.valueType,
                options: setting.defaultValue ? setting.defaultValue.split(',').map(option => option.trim()) : []
            }));
            setEventData(prev => ({ ...prev, settings: defaultSettings }));
        }
    }

    // Gérer la création de l'événement
    async function handleCreateEvent(e) {
        e.preventDefault();

        // Validation de l'heure de fin (doit être après l'heure de début)
        if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
            console.error('L\'heure de fin doit être après l\'heure de début');
            return;
        }

        // Ajouter groupId à eventData pour s'assurer qu'il est inclus
        const Settings = eventData.settings.map((setting) => ({
            key: setting.key,
            value: setting.value || '',
        }));

        const eventPayload = { ...eventData, groupId: id ,
            settings:Settings};
        try {
            await axios.post(`${API_URL}/events`, eventPayload, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            onClose();
            onEventCreated();
        } catch (error) {
            console.error('Erreur lors de la création de l\'événement :', error);
        }
    }

    // Gérer les changements dans les paramètres
    function handleSettingChange(index, value) {
        const updatedSettings = [...eventData.settings];

        if (Array.isArray(value)) {
            updatedSettings[index].value = value.join(','); // Join values for list-type settings
        } else {
            updatedSettings[index].value = value;
        }

        setEventData({ ...eventData, settings: updatedSettings });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white rounded-lg p-6 w-96 shadow-lg modal-content">
                <h2 className="text-2xl mb-4">Créer un nouvel événement</h2>
                <form onSubmit={handleCreateEvent}>
                    <input
                        type="text"
                        placeholder="Titre"
                        value={eventData.title}
                        onChange={(e) => setEventData({...eventData, title: e.target.value})}
                        required
                        className="w-full p-3 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <textarea
                        placeholder="Description"
                        value={eventData.description}
                        onChange={(e) => setEventData({...eventData, description: e.target.value})}
                        required
                        className="w-full p-3 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                        type="datetime-local"
                        value={eventData.startTime}
                        onChange={(e) => setEventData({...eventData, startTime: e.target.value})}
                        required
                        className="w-full p-3 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                        type="datetime-local"
                        value={eventData.endTime}
                        onChange={(e) => setEventData({...eventData, endTime: e.target.value})}
                        required
                        className="w-full p-3 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="mb-3">
                        <label className="block text-sm font-medium">Couleur de l'événement</label>
                        <input
                            type="color"
                            value={eventData.color}
                            onChange={(e) => setEventData({...eventData, color: e.target.value})}
                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <select
                        value={eventData.gameId}
                        onChange={(e) => handleGameChange(e.target.value)}
                        required
                        className="w-full p-3 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Sélectionner un jeu</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>

                    {/* Paramètres dynamiques d'équipes */}
                    {eventData.settings.length > 0 && (
                        <div className="team-settings mb-4">
                            <h3 className="text-xl mb-2">Paramètres d'équipes</h3>
                            {eventData.settings.map((setting, index) => (
                                <div key={index} className="setting-input mb-3">
                                    <label className="block text-sm font-medium">{setting.key}</label>
                                    {/* Affichage des types de paramètres */}
                                    {setting.valueType === 'LIST' ? (
                                        <Autocomplete
                                            multiple
                                            id={`autocomplete-${setting.key}`}
                                            options={setting.options}
                                            value={setting.value ? setting.value.split(',').map(item => item.trim()) : []}
                                            onChange={(event, newValue) => handleSettingChange(index, newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    placeholder="Sélectionner des options"
                                                    className="w-full p-3 mb-2 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        label={option}
                                                        {...getTagProps({index})}
                                                        className="mr-2 mb-2"
                                                    />
                                                ))
                                            }
                                        />
                                    ) : setting.valueType === 'INTEGER' ? (
                                        <input
                                            type="number"
                                            value={setting.value}
                                            onChange={(e) => handleSettingChange(index, e.target.value)}
                                            placeholder={`Valeur par défaut : ${setting.defaultValue}`}
                                            className="w-full p-3 mb-2 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : setting.valueType === 'STRING' ? (
                                        <input
                                            type="text"
                                            value={setting.value}
                                            onChange={(e) => handleSettingChange(index, e.target.value)}
                                            placeholder={`Valeur par défaut : ${setting.defaultValue}`}
                                            className="w-full p-3 mb-2 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : setting.valueType === 'BOOLEAN' ? (
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                checked={setting.value === 'true'}
                                                onChange={(e) => handleSettingChange(index, e.target.checked ? 'true' : 'false')}
                                                className="mr-2"
                                            />
                                            <label className="text-sm text-gray-400">{setting.key}</label>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between mt-4">
                        <button type="submit"
                                className="w-1/2 p-3 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                            Créer
                        </button>
                        <button type="button" onClick={onClose}
                                className="w-1/2 p-3 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
