import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

/**
 * ProtectedRoute — Prevents unauthorized access
 * Redirects to login if not authenticated
 * Redirects based on role if accessing wrong dashboard
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Memverifikasi akses..." />;
  }

  // Not logged in → redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Waiting for user data to load
  if (!userData) {
    return <LoadingSpinner fullScreen text="Memuat data pengguna..." />;
  }

  // Role check — prevent students from accessing admin and vice versa
  if (requiredRole && userData.role !== requiredRole) {
    if (userData.role === 'spg') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
