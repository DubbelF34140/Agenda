import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
