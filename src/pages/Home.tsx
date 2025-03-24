import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, GamepadIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Gaming Groups
        </h1>
        <p className="text-xl text-gray-600">
          Create and manage your gaming groups, schedule events, and connect with fellow gamers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-8 transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-semibold ml-3">Create Groups</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Form gaming groups for your favorite games and invite fellow players to join.
          </p>
          <Link
            to="/groups"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <span>Manage Groups</span>
            <GamepadIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center mb-4">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-semibold ml-3">Schedule Events</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Plan gaming sessions and keep track of upcoming events with your group.
          </p>
          <Link
            to="/groups"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <span>View Calendar</span>
            <Calendar className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="mt-16 text-center">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070"
          alt="Gaming Setup"
          className="rounded-lg shadow-xl mx-auto max-w-full"
        />
      </div>
    </div>
  );
}