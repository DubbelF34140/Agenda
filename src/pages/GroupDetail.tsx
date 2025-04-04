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
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showNewEventModal, setShowNewEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', start: '', end: '' });
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; userId: string; role: string } | null>(null);
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
            setLoading(false);
        }

        fetchGroupData();
    }, [id]);

    const getNextHigherRole = (role: string) => {
        switch (role) {
            case "MEMBER": return "MODERATOR";
            case "MODERATOR": return "ADMIN";
            default: return role;
        }
    };

    const getNextLowerRole = (role: string) => {
        switch (role) {
            case "ADMIN": return "MODERATOR";
            case "MODERATOR": return "MEMBER";
            default: return role;
        }
    };

    const handleRightClick = (event: React.MouseEvent, member: any) => {
        if (member.role !== 'OWNER') {
            event.preventDefault();
            const { clientX: x, clientY: y } = event;
            setContextMenu({
                visible: true,
                x: Math.min(x, window.innerWidth - 150),
                y: Math.min(y, window.innerHeight - 50),
                userId: member.id,
                role: member.role
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const promoteMember = async () => {
        if (!contextMenu) return;
        try {
            await axios.post(`${API_URL}/groups/${id}/promote`, { userId: contextMenu.userId }, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
            setMembers(members.map(m => m.user_id === contextMenu.userId ? { ...m, role: getNextHigherRole(m.role) } : m));
            location.reload()
        } catch (error) {
            alert("Erreur lors de la promotion : " + error.response?.data);
        }
    };

    const demoteMember = async () => {
        if (!contextMenu) return;
        try {
            await axios.post(`${API_URL}/groups/${id}/demote`, { userId: contextMenu.userId }, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
            setMembers(members.map(m => m.user_id === contextMenu.userId ? { ...m, role: getNextLowerRole(m.role) } : m));
            location.reload()
        } catch (error) {
            alert("Erreur lors de la rétrogradation : " + error.response?.data);
        }
    };

    const handleRemoveUser = async () => {
        const token = getAuthToken();

        try {
            const response = await axios.post(
                `${API_URL}/groups/${id}/remove`,
                { userId: contextMenu.userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            console.log('User removed successfully', response);
            location.reload()
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

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-600"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-l-4 border-r-4 border-green-500 absolute top-2 left-2"></div>
                    <div className="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-20"></div>
                </div>
                <p className="text-green-500 font-bold mt-4 animate-pulse">LOADING...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(90vh-5rem)] border-gray-700">
            {/* Members Sidebar */}
            <div className="w-64 bg-gray-900 text-white border-r border-gray-800 p-4 overflow-y-auto rounded-l-2xl ">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Members</h2>
                    <button onClick={() => setShowInviteModal(true)} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">Invite</button>
                </div>

                <div className="space-y-2">
                    {members.map((member) => (
                        <div key={member.user_id} className="flex items-center space-x-2 p-2 hover:bg-indigo-500 rounded relative" onContextMenu={(e) => handleRightClick(e, member)}>
                            {member.avatarUrl ? <img src={member.avatarUrl} alt={member.pseudo} className="w-8 h-8 rounded-full" /> : <UserIcon className="w-8 h-8 p-1 bg-gray-100 rounded-full text-gray-600" />}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{member.pseudo}</p>
                                <p className="text-xs">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 p-6 overflow-hidden bg-gray-800 rounded-r-2xl">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth'
                    }}
                    events={events.map(event => ({
                        id: event.id,
                        title: event.title,
                        start: new Date(event.startTime).toISOString(),
                        end: new Date(event.endTime).toISOString(),
                        description: event.description,
                        game: event.game,
                        eventSettings: event.eventSettings,
                        backgroundColor: event.color,
                        className: "absolute left-1 top-1/2 transform -translate-y-1/2 bg-white/20 px-1 rounded text-xs truncate max-w-24"
                    }))}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    eventClick={({ event }) => handleEventClick(event)}
                    select={handleDateSelect}
                    height="auto"
                    dayHeaderClassNames={"bg-gray-800 text-xs text-gray-400 mb-2"}
                    dayCellClassNames={"relative p-2 rounded text-sm h-16 text-white hover:bg-gray-700"}

                />

                {showNewEventModal && (
                    <NewEventForm
                        onClose={() => setShowNewEventModal(false)}
                        onEventCreated={handleEventCreated}
                        datestartTime={newEvent.start}
                    />
                )}
            </div>

            {/* Context Menu */}
            {contextMenu?.visible && (
                <div className="absolute bg-gray-800 text-white rounded shadow-lg py-2 px-4" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={handleRemoveUser} className="block px-4 py-2 text-sm hover:bg-red-600 w-full text-left">Kick User</button>
                    <button
                        onClick={promoteMember}
                        disabled={contextMenu.role === "ADMIN"}
                        className={`block px-4 py-2 text-sm w-full text-left ${contextMenu.role === "ADMIN" ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"}`}
                    >
                        Promouvoir
                    </button>
                    <button
                        onClick={demoteMember}
                        disabled={contextMenu.role === "MEMBER" || contextMenu.role === "GUEST"}
                        className={`block px-4 py-2 text-sm w-full text-left ${contextMenu.role === "MEMBER" || contextMenu.role === "GUEST" ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-600"}`}
                    >
                        Rétrograder
                    </button>
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
