import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CogIcon, HomeIcon, UserCircleIcon, UserGroupIcon, ArrowRightOnRectangleIcon, UserIcon } from "@heroicons/react/24/solid";

// Déclaration correcte de l'URL de l'API
const API_URL = import.meta.env.VITE_API_URL;

// Définition du type de l'utilisateur
interface User {
  id: string;
  pseudo: string;
  administrateur?: boolean;
  avatarUrl: string;
}

// Composant du menu déroulant
const AvatarDropdownMenu: React.FC<{
  user: User | null,
  onSignOut: () => void,
  isAdmin: boolean
}> = ({ user, onSignOut, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
      <div className="relative" ref={dropdownRef}>
        {/* Avatar Clickable */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
        >
          {user?.avatarUrl ? (
              <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
          ) : (
              <UserCircleIcon className="w-10 h-10 text-white" />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user?.pseudo || 'Utilisateur'}
                </p>
              </div>

              <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsOpen(false)}
              >
                <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                Profil
              </Link>

              {isAdmin && (
                  <Link
                      to="/game"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                  >
                    <CogIcon className="w-5 h-5 mr-2 text-gray-600" />
                    Panneau de jeu
                  </Link>
              )}

              <button
                  onClick={onSignOut}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Déconnexion
              </button>
            </div>
        )}
      </div>
  );
};

// Composant Navbar
export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setIsAdmin(!!currentUser.administrateur);
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  // Vérifie si l'utilisateur est connecté en recherchant un token dans le localStorage
  const isLoggedIn = !!localStorage.getItem('authToken');

  const handleSignOut = async () => {
    try {
      // Retirer le token du localStorage et rediriger vers la page de connexion
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAdmin(false);
      navigate('/auth');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
            <span className="text-2xl font-bold text-white tracking-wider">
              Gaming Groups
            </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                  to="/"
                  className="text-white hover:bg-white/20 px-3 py-2 rounded-md transition-colors flex items-center space-x-2"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Accueil</span>
              </Link>

              <Link
                  to="/groups"
                  className="text-white hover:bg-white/20 px-3 py-2 rounded-md transition-colors flex items-center space-x-2"
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>Groupes</span>
              </Link>

              {/* User Authentication and Avatar */}
              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                    <AvatarDropdownMenu
                        user={currentUser}
                        onSignOut={handleSignOut}
                        isAdmin={isAdmin}
                    />
                ) : (
                    <Link
                        to="/auth"
                        className="text-white hover:bg-white/20 px-3 py-2 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Connexion</span>
                    </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
  );
}