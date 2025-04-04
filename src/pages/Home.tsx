import React from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, CalendarIcon, RocketLaunchIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/16/solid";

export default function Home() {
  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
      <div className="text-white min-h-screen w-full" style={{ paddingTop: "8vh" }}>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute rounded-xl inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-75 animate-gradient-slow"></div>

          {/* Hero Content */}
          <div className="relative container mx-auto px-4 py-12 md:py-24 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Gaming Calendar
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-10 max-w-3xl mx-auto text-gray-300">
              Connect, Compete, Conquer. Find your team, schedule epic gaming sessions, and dominate the virtual
              battlefield.
            </p>
            <div className="flex justify-center space-x-4">
              {isLoggedIn ? (
                  <Link
                      to="/groups"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Find Your Crew</span>
                  </Link>
              ) : (
                  <Link
                      to="/auth"
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Get Started</span>
                  </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {/* Feature Cards */}
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center transform transition-all hover:scale-105 hover:bg-gray-700">
              <UserGroupIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-purple-400" />
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Create Groups</h3>
              <p className="text-gray-400 text-sm md:text-base">
                Form elite squads for your favorite games and recruit top talent.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center transform transition-all hover:scale-105 hover:bg-gray-700">
              <CalendarIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-green-400" />
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Event Scheduling</h3>
              <p className="text-gray-400 text-sm md:text-base">
                Plan epic gaming marathons and coordinate team strategies.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center transform transition-all hover:scale-105 hover:bg-gray-700">
              <TrophyIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-yellow-400" />
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Competitions</h3>
              <p className="text-gray-400 text-sm md:text-base">
                Join tournaments and climb the leaderboards with your team.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center transform transition-all hover:scale-105 hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                   className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-blue-400">
                <path fillRule="evenodd"
                      d="M14.615 1.595a.75.75 0 0 1 .75.75v15.08a.75.75 0 0 1-1.5 0V2.345a.75.75 0 0 1 .75-.75ZM9.969 5.03a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H10.72a.75.75 0 0 1-.75-.75ZM4.969 9.03a.75.75 0 0 1 .75-.75h15.5a.75.75 0 0 1 0 1.5H5.72a.75.75 0 0 1-.75-.75ZM2.719 13.03a.75.75 0 0 1 .75-.75H18.97a.75.75 0 0 1 0 1.5H3.47a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd" />
              </svg>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Communication</h3>
              <p className="text-gray-400 text-sm md:text-base">
                Chat, strategize, and connect with gamers worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Gaming Setup Section */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 text-center transform transition-all relative">
          {/* Subtle Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-black/20 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
            <div className="text-left px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Your Ultimate Gaming Command Center
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 md:mb-6">
                Transform the way you game. Gaming Groups isn't just a platform—it's your strategic headquarters for
                dominating the digital realm, connecting with elite players, and turning every session into an epic
                adventure.
              </p>
              <div className="space-y-3 md:space-y-5 mb-6 md:mb-8">
                <div className="flex items-start sm:items-center space-x-3 md:space-x-4 bg-gray-800 p-3 md:p-4 rounded-lg hover:bg-gray-700 transition">
                  <RocketLaunchIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-400 flex-shrink-0 mt-1 sm:mt-0" />
                  <div>
                    <h4 className="font-bold text-base md:text-lg">Instant Group Formation</h4>
                    <p className="text-gray-400 text-sm md:text-base">Create and join gaming squads with lightning speed. No more solo
                      queuing.</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center space-x-3 md:space-x-4 bg-gray-800 p-3 md:p-4 rounded-lg hover:bg-gray-700 transition">
                  <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-green-400 flex-shrink-0 mt-1 sm:mt-0" />
                  <div>
                    <h4 className="font-bold text-base md:text-lg">Pro-Level Event Management</h4>
                    <p className="text-gray-400 text-sm md:text-base">Schedule, track, and optimize your gaming marathons with military
                      precision.</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center space-x-3 md:space-x-4 bg-gray-800 p-3 md:p-4 rounded-lg hover:bg-gray-700 transition">
                  <TrophyIcon className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 flex-shrink-0 mt-1 sm:mt-0" />
                  <div>
                    <h4 className="font-bold text-base md:text-lg">Global Competitive Arena</h4>
                    <p className="text-gray-400 text-sm md:text-base">Access tournaments, leaderboards, and competitive challenges across
                      genres.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Interface Preview - Hidden on Mobile, Custom on Tablet */}
            <div className="hidden sm:block">
              <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transform hover:scale-105 transition-transform flex flex-col md:flex-row">
                {/* Mock Sidebar - Full Width on Small Screens, Side Column on Larger */}
                <div className="w-full md:w-64 bg-gray-900 border-b md:border-r md:border-b-0 border-gray-800 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Members</h2>
                    <button className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                      Invite
                    </button>
                  </div>

                  {/* Mock Member List */}
                  <div className="space-y-2">
                    {['PlayerOne', 'GamerPro', 'NightHawk'].map((name, index) => (
                        <div key={name} className="flex items-center space-x-2 p-2 hover:bg-indigo-500 rounded">
                          <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 p-1 bg-gray-100 rounded-full text-gray-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{name}</p>
                            <p className="text-xs text-gray-400">
                              {index === 0 ? 'Admin' : index === 1 ? 'Moderator' : 'Member'}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Mock Calendar - Simplified on Smaller Screens */}
                <div className="flex-1 p-2 sm:p-4">
                  {/* Calendar Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <button className="text-xs sm:text-sm bg-gray-700 text-white px-1 sm:px-2 py-1 rounded">Prev</button>
                      <button className="text-xs sm:text-sm bg-gray-700 text-white px-1 sm:px-2 py-1 rounded">Next</button>
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold">March 2025</h2>
                    <button className="text-xs sm:text-sm bg-indigo-600 text-white px-1 sm:px-2 py-1 rounded">Today</button>
                  </div>

                  {/* Calendar Grid - Simplified for Smaller Screens */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => (
                        <div key={day} className="text-xs text-gray-400 mb-1 sm:mb-2">{day}</div>
                    ))}
                    {[...Array(31)].map((_, index) => (
                        <div
                            key={index}
                            className={`
                        relative p-1 sm:p-2 rounded text-xs sm:text-sm h-8 sm:h-12 md:h-16 
                        ${index === 14 ? 'text-white' : ''}
                        ${index === 22 ? 'text-white' : ''}
                        ${[0, 6, 7, 13, 20, 27].includes(index) ? 'bg-gray-700 text-gray-400' : 'text-white'}
                      `}
                        >
                          {/* Date number in top left */}
                          <div className="absolute top-0 left-1 text-xs">
                            {index + 1}
                          </div>

                          {/* Event in middle left - Smaller Font on Mobile */}
                          {(index === 14 || index === 22) && (
                              <div className="absolute left-1 bottom-0 sm:top-1/2 sm:transform sm:-translate-y-1/2 bg-white/20 px-1 rounded text-xs truncate max-w-full hidden sm:block">
                                {index === 14 ? 'Valorant' : 'Lol'}
                              </div>
                          )}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
        @keyframes gradient-animation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-animation 15s ease infinite;
        }
      `}</style>
      </div>
  );
}
