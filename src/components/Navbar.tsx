// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Déclaration correcte de l'URL de l'API
// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

// Définition du type de l'utilisateur
interface User {
  administrateur?: boolean;
}

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
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-800">Gaming Groups</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                  to="/groups"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Groups
              </Link>

              {isAdmin && (
                  <Link
                      to="/game"
                      className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Game Panel
                  </Link>
              )}
              {isLoggedIn ? (
                  <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <span>Sign Out</span>
                  </button>
              ) : (
                  <Link
                      to="/auth"
                      className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
}
