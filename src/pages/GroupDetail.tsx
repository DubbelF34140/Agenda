import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserIcon } from "@heroicons/react/16/solid";
import InviteUserModal from '../components/InviteUserModal';
import axios from "axios";

// Fonction pour récupérer le token JWT depuis le localStorage
const getAuthToken = () => localStorage.getItem('authToken');

export default function GroupDetails() {
    const { id } = useParams<{ id: string }>();
    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showNewEventModal, setShowNewEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', start: '', end: '' });
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; userId: string } | null>(null);
    const API_URL = import.meta.env.VITE_API_URL;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

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

            const userResponse = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
            const userData = await userResponse.json();
            setCurrentUserId(userData.id);

            const currentUser = membersData.find((member: any) => member.user_id === userData.id);
            setCurrentUserRole(currentUser ? currentUser.role : null);
        }

        fetchGroupData();
    }, [id]);

    const handleRightClick = (event: React.MouseEvent, member: any) => {
        event.preventDefault();

        if ((currentUserRole === 'OWNER' || currentUserRole === 'MODERATOR') && member.role !== 'OWNER') {
            console.log('right click')
            setContextMenu({ visible: true, x: event.clientX, y: event.clientY, userId: member.user_id });
        }
    };

    const handleRemoveUser = async (userId: string) => {
        const token = getAuthToken();

        try {
            const response = await axios.post(
                `${API_URL}/api/groups/${id}/remove`,
                { userId: userId },
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

        setMembers(members.filter((member) => member.user_id !== userId));
        setContextMenu(null);
    };

    const handleCreateEvent = async () => {
        const token = getAuthToken();
        const eventData = { title: newEvent.title, description: newEvent.description, start_time: newEvent.start, end_time: newEvent.end };

        await fetch(`${API_URL}/groups/${id}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(eventData),
        });

        setShowNewEventModal(false);
        setNewEvent({ title: '', description: '', start: '', end: '' });
    };

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
                        events={events.map(event => ({ id: event.id, title: event.title, start: event.start_time, end: event.end_time, description: event.description }))}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        eventClick={(info) => alert(`Event: ${info.event.title}\nDescription: ${info.event.extendedProps.description}`)}
                        select={(selectInfo) => setNewEvent({ title: '', description: '', start: selectInfo.startStr, end: selectInfo.endStr }) || setShowNewEventModal(true)}
                        height="100%"
                    />
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu?.visible && (
                <div className="absolute bg-gray-800 text-white rounded shadow-lg py-2 px-4" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={() => handleRemoveUser(contextMenu.userId)} className="block px-4 py-2 text-sm hover:bg-red-600 w-full text-left">Remove User</button>
                </div>
            )}

            {/* New Event Modal */}
            {showNewEventModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-black text-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
                        <input type="text" placeholder="Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full p-2 mb-2 rounded bg-gray-800 text-white" />
                        <textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full p-2 mb-2 rounded bg-gray-800 text-white" />
                        <button onClick={handleCreateEvent} className="bg-indigo-600 text-white px-4 py-2 rounded w-full">Create</button>
                    </div>
                </div>
            )}
            {showInviteModal && <InviteUserModal groupId={id as string} onClose={() => setShowInviteModal(false)} />}
        </div>
    );
}