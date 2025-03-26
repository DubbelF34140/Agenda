import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserIcon } from "@heroicons/react/16/solid";
import InviteUserModal from '../components/InviteUserModal';
import NewEventForm from '../components/NewEventForm';
import axios from "axios";
import EventDetailsModal from "../components/EventDetailsModal.tsx";

// Fonction pour récupérer le token JWT depuis le localStorage
const getAuthToken = () => localStorage.getItem('authToken');

export default function GroupDetails() {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') as string));
    const { id } = useParams<{ id: string }>();
    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showNewEventModal, setShowNewEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', start: '', end: '' });
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; userId: string } | null>(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const [deletedID, setDeletedID] = useState<string | null>(null);
    const currentUserRole = members.find(member => member.id === currentUser.id)?.role || 'GUEST';
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        async function fetchGroupData() {
            const token = getAuthToken();

            const groupResponse = await fetch(`${API_URL}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            const groupData = await groupResponse.json();
            setGroup(groupData);

            const membersResponse = await fetch(`${API_URL}/groups/${id}/members`, { headers: { Authorization: `Bearer ${token}` } });
            const membersData = await membersResponse.json();
            setMembers(membersData);

            const eventsResponse = await fetch(`${API_URL}/groups/${id}/events`, { headers: { Authorization: `Bearer ${token}` } });
            const eventsData = await eventsResponse.json();
            setEvents(eventsData);
        }

        fetchGroupData();
    }, [id]);

    const handleRightClick = (event: React.MouseEvent, member: any) => {
        if (member.role !== 'OWNER'){
            event.preventDefault();
            const { clientX: x, clientY: y } = event;
            const maxX = window.innerWidth - 150;
            const maxY = window.innerHeight - 50;
            setDeletedID(member.id);

            setContextMenu({
                visible: true,
                x: Math.min(x, maxX),
                y: Math.min(y, maxY),
                userId: member.id
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleRemoveUser = async () => {
        const token = getAuthToken();

        try {
            const response = await axios.post(
                `${API_URL}/groups/${id}/remove`,
                { userId: deletedID },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            console.log('User removed successfully', response);
        } catch (error) {
            console.error('Error removing user', error.response ? error.response.data : error.message);
        }

        setMembers(members.filter((member) => member.user_id !== deletedID));
        setContextMenu(null);
    };

    const handleDateSelect = (selectInfo: any) => {
        // Set the start and end time when a date is selected
        const selectedStart = selectInfo.startStr;
        const selectedEnd = selectInfo.endStr;

        // Open the modal and pass the selected start date
        setShowNewEventModal(true);
        setNewEvent({ ...newEvent, start: selectedStart, end: selectedEnd });
    };


    const handleEventCreated = () => {
        // Rechargement des événements après la création d'un événement
        async function fetchEvents() {
            const token = getAuthToken();
            const eventsResponse = await fetch(`${API_URL}/groups/${id}/events`, { headers: { Authorization: `Bearer ${token}` } });
            const eventsData = await eventsResponse.json();
            setEvents(eventsData);
        }
        fetchEvents();
    };

    const handleEventClick = (event: any) => {
        setSelectedEvent({
            id: event.id,
            title: event.title,
            description: event.extendedProps.description || "Pas de description",
            startTime: event.startStr,
            endTime: event.endStr,
            color: event.backgroundColor || "#000",
            game: event.extendedProps.game || null,
            eventSettings: event.extendedProps.eventSettings || null,
        });
        setIsModalOpen(true);
    };

    function handleEventDeleted(deletedEventId) {
        setEvents(events.filter(event => event.id !== deletedEventId));
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Members Sidebar */}
            <div className="w-64 bg-gray-900 text-white border-r border-gray-800 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Members</h2>
                    <button onClick={() => setShowInviteModal(true)} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">Invite</button>
                </div>

                <div className="space-y-2">
                    {members.map((member) => (
                        <div key={member.user_id} className="flex items-center space-x-2 p-2 hover:bg-indigo-500 rounded relative" onContextMenu={(e) => handleRightClick(e, member)}>
                            {member.avatar_url ? <img src={member.avatar_url} alt={member.pseudo} className="w-8 h-8 rounded-full" /> : <UserIcon className="w-8 h-8 p-1 bg-gray-100 rounded-full text-gray-600" />}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{member.pseudo}</p>
                                <p className="text-xs">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 p-4">
                <div className="rounded-lg shadow-lg h-full p-4">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                        events={events.map(event => ({
                            id: event.id,
                            title: event.title,
                            start: new Date(event.startTime).toISOString(),
                            end: new Date(event.endTime).toISOString(),
                            description: event.description,
                            game: event.game,
                            eventSettings: event.eventSettings,
                            backgroundColor: event.color,
                        }))}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        eventClick={({ event }) => handleEventClick(event)}
                        select={handleDateSelect}
                        height="100%"
                    />

                    {showNewEventModal && (
                        <NewEventForm
                            onClose={() => setShowNewEventModal(false)}
                            onEventCreated={handleEventCreated}
                            datestartTime={newEvent.start}
                        />
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu?.visible && (
                <div className="absolute bg-gray-800 text-white rounded shadow-lg py-2 px-4" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={handleRemoveUser} className="block px-4 py-2 text-sm hover:bg-red-600 w-full text-left">Remove User</button>
                </div>
            )}

            {showInviteModal && <InviteUserModal groupId={id as string} onClose={() => setShowInviteModal(false)} />}

            <EventDetailsModal
                event={selectedEvent}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEventDeleted={handleEventDeleted}
                userRole={currentUserRole}  // OWNER / MODERATOR / MEMBER
            />
        </div>
    );
}