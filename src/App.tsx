// @ts-ignore
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Importation correcte
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Groups from './pages/Groups';
import Auth from './pages/Auth';
import SignUp from './pages/SignUp.tsx';
import GroupDetails from "./pages/GroupDetail.tsx";
import AdminRoute from "./components/AdminRoute.tsx";
import Games from "./pages/GameList.tsx";

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route
                                path="/groups"
                                element={
                                    <PrivateRoute>
                                        <Groups />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/game"
                                element={
                                    <AdminRoute>
                                        <Games />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/groups/:id"
                                element={
                                    <PrivateRoute>
                                        <GroupDetails/>
                                    </PrivateRoute>
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
