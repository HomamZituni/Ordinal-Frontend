import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
// Wraps protected pages and checks if user logged in, otherwise redirects to login page
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
