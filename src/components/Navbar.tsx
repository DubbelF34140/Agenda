import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">Gaming Groups</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/groups"
              className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Groups
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}