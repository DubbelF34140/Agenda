import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('authToken');

export default function EventDetails({ event, onClose }) {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Vérifier si le jeu nécessite des équipes
        const nbTeamsSetting = event.settings.find(s => s.key === "nbTeams");
        if (nbTeamsSetting) {
            const teamCount = parseInt(nbTeamsSetting.value, 10);
            const generatedTeams = Array.from({ length: teamCount }, (_, i) => `Équipe ${i + 1}`);
            setTeams(generatedTeams);
        }
    }, [event]);

    async function handleJoinEvent() {
        try {
            await axios.post(`${API_URL}/events/${event.id}/join`, { team: selectedTeam }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setMessage("Inscription réussie !");
        } catch (error) {
            setMessage("Erreur lors de l'inscription.");
        }
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>{event.title}</h2>
                <p>{event.description}</p>
                <p><strong>Jeu :</strong> {event.game.name}</p>

                {/* Si le jeu nécessite des équipes, afficher le choix */}
                {teams.length > 0 && (
                    <div>
                        <h3>Choisissez une équipe :</h3>
                        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                            <option value="">Sélectionner une équipe</option>
                            {teams.map((team, index) => (
                                <option key={index} value={team}>{team}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button onClick={handleJoinEvent}>S'inscrire</button>
                {message && <p>{message}</p>}

                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
}
