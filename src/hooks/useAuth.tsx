import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false); // If no token, stop loading and assume no user
    }
  }, []);

  // Fetch user based on JWT token
  async function fetchUser(token: string) {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      localStorage.setItem('user', await response.text());

      if (!response.ok) {
        console.error(`Failed to fetch user, status code: ${response.status}`);
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user); // Set the user if the request is successful
      setLoading(false); // Stop loading after user data is fetched
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false); // Stop loading even if there is an error
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token); // Save the token
        fetchUser(data.token); // Fetch user data with the token
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken'); // Remove the token
    setUser(null); // Clear user data
    setLoading(false); // Stop loading state
    navigate('/auth'); // Redirect to login page
  };

  return (
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}