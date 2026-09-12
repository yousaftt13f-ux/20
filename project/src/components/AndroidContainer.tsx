import React from 'react';
import AndroidStatusBar from './AndroidStatusBar';
import AndroidBottomNav from './AndroidBottomNav';
import QuickSettingsShade from './QuickSettingsShade';
import AndroidToast from './AndroidToast';
import { useLocation } from 'react-router-dom';

interface AndroidContainerProps {
  children: React.ReactNode;
}

export const AndroidContainer: React.FC<AndroidContainerProps> = ({ children }) => {
  const location = useLocation();
  const isVideoCall = location.pathname.startsWith('/video-call');
  const isStoryViewer = location.pathname.startsWith('/story');

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white flex justify-center items-center overflow-x-hidden font-cairo select-none">
      {/* Device frame on desktop / full screen on mobile */}
      <div className="w-full h-screen sm:h-[92vh] sm:max-w-[430px] sm:max-h-[890px] sm:rounded-[44px] sm:ring-8 sm:ring-neutral-800 sm:shadow-[0_25px_60px_-15px_rgba(225,29,72,0.3)] bg-black relative flex flex-col overflow-hidden sm:border sm:border-white/10">
        {/* Android Punch Hole Camera */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-[100] border border-neutral-800 shadow-inner flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-700/50" />
        </div>

        {/* Android Status Bar */}
        <AndroidStatusBar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </main>

        {/* Android Bottom Navigation Bar (Hidden during full-screen calls or stories) */}
        {!isVideoCall && !isStoryViewer && <AndroidBottomNav />}

        {/* Android Gesture Pill at bottom */}
        <div className="w-full h-4 bg-transparent flex items-center justify-center pointer-events-none z-50 pb-1">
          <div className="w-32 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Android Quick Settings Shade (Pull-down) */}
        <QuickSettingsShade />

        {/* Android Native Floating Toast */}
        <AndroidToast />
      </div>
    </div>
  );
};

export default AndroidContainer;
