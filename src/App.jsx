import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WeeklyMenuPage from './pages/WeeklyMenuPage';
import VotingPage from './pages/VotingPage';
import HistoryPage from './pages/HistoryPage';
import VotingResultsPage from './pages/VotingResultsPage';
import FeedbackPage from './pages/FeedbackPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.liquid-glass, .liquid-glass-danger, .glass');
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Student Routes ── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu-mingguan"
              element={
                <ProtectedRoute requiredRole="student">
                  <WeeklyMenuPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voting"
              element={
                <ProtectedRoute requiredRole="student">
                  <VotingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/riwayat"
              element={
                <ProtectedRoute requiredRole="student">
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            {/* ── Admin Routes ── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="spg">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menus"
              element={
                <ProtectedRoute requiredRole="spg">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/voting"
              element={
                <ProtectedRoute requiredRole="spg">
                  <VotingResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute requiredRole="spg">
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/laporan"
              element={
                <ProtectedRoute requiredRole="spg">
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
