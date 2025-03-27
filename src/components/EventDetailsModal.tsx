import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon, UserPlusIcon, UserMinusIcon, BookmarkSquareIcon } from '@heroicons/react/24/solid';
import {Autocomplete, Chip, TextField} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');
const user = JSON.parse(localStorage.getItem('user') as string);

export default function EventDetailsModal({ event, open, onClose, onEventDeleted, onEventUpdated, userRole }) {
    if (!event) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedEvent, setEditedEvent] = useState({ ...event });
    const [editedSettings, setEditedSettings] = useState(event.eventSettings || []);
    const [participants, setParticipants] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [playerSettings, setPlayerSettings] = useState([]);


    useEffect(() => {
        checkIfRegistered();
        fetchParticipants();
        if (event?.game?.id) {
            fetchGameSettings(event.game.id);
        }
    }, [event]);

    const fetchGameSettings = async (gameId) => {
        try {
            const response = await axios.get(`${API_URL}/games/${gameId}`);
            setPlayerSettings(response.data.playersettings.map(setting => ({
                key: setting.key,
                value: setting.defaultValue,
                valueType: setting.valueType,
                options: setting.defaultValue ? setting.defaultValue.split(',').map(option => option.trim()) : []
            })));
        } catch (error) {
            console.error("Erreur lors du chargement des paramètres du jeu :", error);
        }
    };

    const handlePlayerSettingChange = (index, value) => {
        const updatedSettings = [...playerSettings]; // Créer une copie du tableau de settings

        if (Array.isArray(value)) {
            updatedSettings[index].value = value.join(',');
        } else {
            updatedSettings[index].value = value;
        }

        setPlayerSettings(updatedSettings);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedEvent((prev) => ({ ...prev, [name]: value }));
    };

    const handleSettingChange = (id, newValue) => {
        setEditedSettings((prevSettings) =>
            prevSettings.map((setting) =>
                setting.id === id ? { ...setting, value: newValue } : setting
            )
        );
    };

    async function handleSaveChanges() {
        try {
            const formattedEvent = {
                ...editedEvent,
                startTime: new Date(editedEvent.startTime).toISOString().slice(0, 19),
                endTime: new Date(editedEvent.endTime).toISOString().slice(0, 19),
                settings: editedSettings,
            };

            const response = await axios.put(`${API_URL}/events/${event.id}`, formattedEvent, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onEventUpdated(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
        }
    }

    async function handleDeleteEvent() {
        try {
            await axios.delete(`${API_URL}/events/${event.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onEventDeleted(event.id);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    }

    const checkIfRegistered = async () => {
        try {
            const response = await axios.get(`${API_URL}/events/${event.id}/participants`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userIsRegistered = response.data.some(participant => participant.username === user.pseudo);
            setIsRegistered(userIsRegistered);
        } catch (error) {
            console.error("Erreur lors de la vérification de l'inscription :", error);
        }
    };

    const fetchParticipants = async () => {
        try {
            const response = await axios.get(`${API_URL}/events/${event.id}/participants`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setParticipants(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des participants :", error);
        }
    };

    const handleEventRegistration = async () => {
        try {

            const Settings = playerSettings.map((setting) => ({
                key: setting.key,
                value: setting.value || '',
            }));

            await axios.post(`${API_URL}/events/${event.id}/register`, {playersetting : Settings}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsRegistered(true);
        } catch (error) {
            console.error("Erreur lors de l'inscription :", error);
        }
    };

    const handleUnregisterEvent = async () => {
        try {
            await axios.post(`${API_URL}/events/${event.id}/unregister`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsRegistered(false);
        } catch (error) {
            console.error("Erreur lors de la désinscription :", error);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${open ? 'block' : 'hidden'}`}>
            <div className="relative bg-gray-800 text-white rounded-lg p-6 w-96 shadow-lg max-h-[80vh] overflow-y-auto">
                {/* Close button positioned at top-right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {isEditing ? (
                    <>
                        <h2 className="text-2xl mb-4">Modifier l'événement</h2>
                        <input
                            type="text"
                            name="title"
                            value={editedEvent.title}
                            onChange={handleChange}
                            className="w-full p-2 mb-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Titre"
                        />
                        <textarea
                            name="description"
                            value={editedEvent.description}
                            onChange={handleChange}
                            className="w-full p-2 mb-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Description"
                        />
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={new Date(editedEvent.startTime).toISOString().slice(0, 16)}
                            onChange={handleChange}
                            className="w-full p-2 mb-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={new Date(editedEvent.endTime).toISOString().slice(0, 16)}
                            onChange={handleChange}
                            className="w-full p-2 mb-4 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        {/* Event Settings Editing */}
                        {editedSettings.length > 0 && editedSettings.some(s => s.key === "Ranked" && s.value === "true") && (
                            <div className="mb-4">
                                <h3 className="text-lg mb-2">Paramètres de l'événement :</h3>
                                {editedSettings
                                    .filter(setting => setting.key !== "Rank" || (editedSettings.find(s => s.key === "Ranked")?.value === "true"))
                                    .map((setting) => (
                                        <div key={setting.id} className="mb-2">
                                            <label className="block mb-1">{setting.key} :</label>
                                            <input
                                                type="text"
                                                value={setting.value}
                                                onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                                className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        )}

                        <div className="flex justify-between space-x-2">
                            <button
                                onClick={handleSaveChanges}
                                className="w-1/2 p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                            >
                                <BookmarkSquareIcon className="h-5 w-5 mr-2" /> Sauvegarder
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="w-1/2 p-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
                            >
                                <XMarkIcon className="h-5 w-5 mr-2" /> Annuler
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl mb-4">{event.title}</h2>
                        <p className="mb-2"><strong>Description :</strong> {event.description || "Aucune description"}</p>
                        <p className="mb-2"><strong>Début :</strong> {new Date(event.startTime).toLocaleString()}</p>
                        <p className="mb-2"><strong>Fin :</strong> {new Date(event.endTime).toLocaleString()}</p>

                        {event.game && (
                            <div className="mt-4 bg-gray-700 p-3 rounded">
                                <p><strong>Jeu: </strong> {event.game.name}</p>
                                <p>
                                    <strong>Informations: </strong> {event.game.description || "Aucune description disponible"}
                                </p>
                            </div>
                        )}

                        {/* Event Settings Display */}
                        {event.eventSettings && event.eventSettings.length > 0 && (
                            <div className="mt-4 bg-gray-700 p-3 rounded">
                                <h3 className="text-lg mb-2">Paramètres de l'événement :</h3>
                                <ul>
                                    {event.eventSettings
                                        .filter(setting => setting.key !== "Rank" || (event.eventSettings.find(s => s.key === "Ranked")?.value === "true"))
                                        .map((setting) => (
                                            <li key={setting.id} className="mb-1"><strong>{setting.key}:</strong> {setting.value}</li>
                                        ))
                                    }
                                </ul>
                            </div>
                        )}

                        <div className="mt-4 bg-gray-700 p-3 rounded">
                            <h3 className="text-lg mb-2">Participants :</h3>
                            <ul>
                                {participants.length === 0 ? (
                                    <li>Aucun participant inscrit</li>
                                ) : (
                                    participants.map((participant) => (
                                        <li key={participant.id || participant.username} className="mb-1">
                                            <div>
                                                <strong>{participant.username}</strong>
                                            </div>
                                            <div className="ml-4">
                                                {participant.playersetting && participant.playersetting.length > 0 ? (
                                                    <ul>
                                                        {participant.playersetting.map((setting, index) => (
                                                            <li key={index} className="text-sm">
                                                                <strong>{setting.key}: </strong>{setting.value}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>Aucun paramètre de joueur disponible</p>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        {!isRegistered ? (
                            <div className={"mt-4 bg-gray-700 p-3 rounded"}>
                                <h3 className="text-lg mb-2">Paramètres du joueur</h3>
                                {playerSettings.length > 0 && (
                                    <>
                                        {playerSettings.map((setting, index) => (
                                            <div key={index} className="mb-3">
                                                <label className="block mb-1">{setting.key}</label>
                                                {setting.valueType === "BOOLEAN" ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={setting.value === "true"}
                                                        onChange={(e) => handlePlayerSettingChange(setting.key, e.target.checked ? "true" : "false")}
                                                    />
                                                ) : setting.valueType === "LIST" ? (
                                                    <Autocomplete
                                                        options={setting.options}
                                                        value={setting.value ? setting.value.split(',').map(item => item.trim()) : []}
                                                        onChange={(event, newValue) => handlePlayerSettingChange(index, newValue)}
                                                        renderInput={(params) => (
                                                            <TextField {...params} variant="outlined" placeholder="Sélectionner des options" />
                                                        )}
                                                        renderTags={(value, getTagProps) =>
                                                            value.map((option, i) => (
                                                                <Chip key={i} label={option} {...getTagProps({ i })} className="mr-2 mb-2" />
                                                            ))
                                                        }
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={setting.value}
                                                        onChange={(e) => handlePlayerSettingChange(setting.key, e.target.value)}
                                                        className="w-full p-2 rounded bg-gray-700 text-white"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ) : (
                            <></>
                        )}

                        <div className="flex justify-between space-x-2 mt-4">
                            {(userRole === 'OWNER' || userRole === 'MODERATOR') && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-1/3 p-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors duration-200 flex items-center justify-center"
                                    >
                                        <PencilIcon className="h-5 w-5 mr-2"/> Modifier
                                    </button>
                                    <button
                                        onClick={handleDeleteEvent}
                                        className="w-1/3 p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                                    >
                                        <TrashIcon className="h-5 w-5 mr-2"/> Supprimer
                                    </button>
                                </>
                            )}

                            {!isRegistered ? (
                                <div>
                                    <button
                                        onClick={handleEventRegistration}
                                        className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                                    >
                                        S'inscrire
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleUnregisterEvent}
                                    className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                                >
                                    Se désinscrire
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}