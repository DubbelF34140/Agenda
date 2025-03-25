import {Navigate} from 'react-router-dom';
import {useEffect, useState} from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  // @ts-ignore
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      setIsAdmin(!!currentUser.administrateur);
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
