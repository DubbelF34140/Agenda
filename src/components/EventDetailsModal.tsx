import React from 'react';
import axios from 'axios';
import { FaRegTrashAlt, FaEdit, FaUserPlus } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');

export default function EventDetailsModal({ event, open, onClose, onEventDeleted, onEventUpdated, userRole }) {
    if (!event) return null;

    // Fonction pour formater les valeurs de "Rank" si elles sont présentes
    const formatRank = (rankString) => {
        return rankString.split(',').map(rank => rank.trim()).join(', ');
    };

    // Fonction de suppression de l'événement
    async function handleDeleteEvent() {
        try {
            await axios.delete(`${API_URL}/events/${event.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            onEventDeleted(event.id);
            onClose();
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement :', error);
        }
    }

    // Fonction pour s'inscrire à l'événement
    async function handleRegisterEvent() {
        try {
            await axios.post(`${API_URL}/events/${event.id}/register`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            alert("Inscription réussie !");
        } catch (error) {
            console.error('Erreur lors de l\'inscription à l\'événement :', error);
        }
    }

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${open ? 'block' : 'hidden'}`}>
            <div className="bg-gray-800 text-white rounded-lg p-6 w-96 shadow-lg max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl mb-4">{event.title}</h2>

                <p><strong>Description :</strong> {event.description || "Aucune description"}</p>
                <p><strong>Début :</strong> {new Date(event.startTime).toLocaleString()}</p>
                <p><strong>Fin :</strong> {new Date(event.endTime).toLocaleString()}</p>

                {event.game && (
                    <div className="mt-4">
                        <p><strong>Jeu: </strong> {event.game.name}</p>
                        <p><strong>Informations: </strong> {event.game.description || "Aucune description disponible"}</p>
                        {event.eventSettings && event.eventSettings.length > 0 && (
                            <ul>
                                {event.eventSettings.map((setting) => (
                                    <li key={setting.id}>
                                        <strong>{setting.key}: </strong>
                                        {setting.key === 'Rank' ? formatRank(setting.value) : setting.value}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <p><strong>Couleur :</strong> <span style={{ color: event.color }}>{event.color}</span></p>

                <div className="flex justify-between items-center mt-4">
                    <button onClick={onClose} className="w-1/3 p-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center">
                        Fermer
                    </button>

                    {(userRole === 'OWNER' || userRole === 'MODERATOR') && (
                        <>
                            <button
                                onClick={() => onEventUpdated(event)}
                                className="w-1/3 p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center justify-center"
                            >
                                <FaEdit className="mr-2" /> Modifier
                            </button>
                            <button
                                onClick={handleDeleteEvent}
                                className="w-1/3 p-3 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                            >
                                <FaRegTrashAlt className="mr-2" /> Supprimer
                            </button>
                        </>
                    )}

                        <button
                            onClick={handleRegisterEvent}
                            className="w-1/3 p-3 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
                        >
                            <FaUserPlus className="mr-2" /> S'inscrire
                        </button>
                </div>
            </div>
        </div>
    );
}