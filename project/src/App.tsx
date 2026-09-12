import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AndroidProvider } from './contexts/AndroidContext';
import { AuthProvider } from './contexts/AuthContext';
import AndroidContainer from './components/AndroidContainer';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';
import Store from './pages/Store';
import Cart from './pages/Cart';
import Notifications from './pages/Notifications';
import ProfilePage from './pages/Profile';
import UserProfile from './pages/UserProfile';
import StoryViewer from './pages/StoryViewer';
import DownloadPage from './pages/Download';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AndroidProvider>
          <AndroidContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/video-call/:id" element={<VideoCall />} />
              <Route path="/store" element={<Store />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user/:username" element={<UserProfile />} />
              <Route path="/story/:userId" element={<StoryViewer />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AndroidContainer>
        </AndroidProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
