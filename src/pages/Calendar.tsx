import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, parseISO } from 'date-fns';
import { Plus, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event, Group } from '../types';

export default function Calendar() {
  const { id } = useParams<{ id: string }>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchGroupDetails();
    fetchEvents();
  }, [id, currentDate]);

  async function fetchGroupDetails() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGroup(data);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  }

  async function fetchEvents() {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('group_id', id)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString());

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.from('events').insert({
        ...newEvent,
        group_id: id,
        created_by: user.id,
      });

      if (error) throw error;

      setShowEventModal(false);
      setNewEvent({ title: '', description: '', start_time: '', end_time: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {group?.name} - Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              {format(currentDate, 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Today
            </button>
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-4 text-center text-sm font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}
          {days.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`bg-white p-4 min-h-[120px] ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                <p
                  className={`text-sm ${
                    isToday(day) ? 'font-bold text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </p>
                <div className="mt-2 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="px-2 py-1 text-sm bg-indigo-100 text-indigo-700 rounded truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, start_time: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, end_time: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}