import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import App from './App.tsx';
import AuthPage from './pages/AuthPage.tsx';
import DiscoverPage from './pages/DiscoverPage.tsx';
import CommunityPage from './pages/CommunityPage.tsx';
import PodPage from './pages/PodPage.tsx';
import FreelancePage from './pages/FreelancePage.tsx';
import StartupsPage from './pages/StartupsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import RoomsPage from './pages/RoomsPage.tsx';
import RoomChatPage from './pages/RoomChatPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page - only accessible when not logged in */}
          <Route path="/" element={<App />} />
          
          {/* Auth page */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route path="/discover" element={
            <ProtectedRoute>
              <DiscoverPage />
            </ProtectedRoute>
          } />
          
          <Route path="/community" element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          } />
          
          <Route path="/pod/:podId" element={
            <ProtectedRoute>
              <PodPage />
            </ProtectedRoute>
          } />
          
          <Route path="/freelance" element={
            <ProtectedRoute>
              <FreelancePage />
            </ProtectedRoute>
          } />
          
          <Route path="/startups" element={
            <ProtectedRoute>
              <StartupsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/rooms" element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/room/:roomId" element={
            <ProtectedRoute>
              <RoomChatPage />
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);