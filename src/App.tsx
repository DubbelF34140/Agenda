import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Calendar from './pages/Calendar';
import Auth from './pages/Auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/groups" 
                element={
                  <PrivateRoute>
                    <Groups />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/groups/:id" 
                element={
                  <PrivateRoute>
                    <GroupDetails />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/groups/:id/calendar" 
                element={
                  <PrivateRoute>
                    <Calendar />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;