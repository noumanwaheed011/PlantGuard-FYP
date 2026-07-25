import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Requires login + isAdmin. Non-admins are sent home; guests go to admin login. */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
