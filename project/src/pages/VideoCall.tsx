import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  MessageSquare,
} from 'lucide-react';

export const VideoCall: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, users } = useAuth();
  const { showToast } = useAndroid();
  const navigate = useNavigate();

  const otherUser = users.find(u => u.id === id) || {
    id: id || 'usr_sara',
    username: 'sara_design',
    full_name: 'سارة الشمري',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    is_verified: true,
  };

  const [callDuration, setCallDuration] = useState<number>(0);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [videoDisabled, setVideoDisabled] = useState<boolean>(false);
  const [speakerOn, setSpeakerOn] = useState<boolean>(true);
  const [filterActive, setFilterActive] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const endCall = () => {
    showToast('انتهت المكالمة', `مدة المكالمة: ${formatTime(callDuration)}`);
    navigate(`/chat/${otherUser.id}`);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col justify-between overflow-hidden select-none font-cairo">
      {/* Background Remote Video Stream */}
      <div className="absolute inset-0 z-0">
        <video
          src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1232-large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover transition-all ${
            filterActive ? 'saturate(200%) hue-rotate(20deg)' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
      </div>

      {/* Top Header: Caller info and timer */}
      <div className="z-10 pt-10 px-6 flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10">
          <img
            src={otherUser.avatar_url}
            alt={otherUser.username}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400"
          />
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1">
              {otherUser.full_name}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-emerald-400 font-mono tracking-wider">
              {formatTime(callDuration)} • مكالمة فيديو 12
            </p>
          </div>
        </div>

        {/* Filter / Effect Toggle */}
        <button
          onClick={() => {
            setFilterActive(prev => !prev);
            showToast('الفلتر', filterActive ? 'تم إلغاء تأثير المكالمة' : 'تم تفعيل فلتر 12 نيون');
          }}
          className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
            filterActive ? 'bg-rose-500 text-white' : 'bg-black/50 text-white/70'
          }`}
          title="تأثيرات الفيديو"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Floating Picture-in-Picture Self Camera (Draggable feel) */}
      <div className="z-10 absolute bottom-32 left-5 w-28 h-40 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-2xl bg-neutral-900">
        {!videoDisabled ? (
          <img
            src={currentUser.avatar_url}
            alt="أنا"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-white/50 text-[10px]">
            <VideoOff className="w-6 h-6 mb-1 text-white/40" />
            <span>الكاميرا مغلقة</span>
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-white font-medium">
          أنت
        </span>
      </div>

      {/* Bottom Floating Call Control Bar */}
      <div className="z-10 pb-8 px-6 flex flex-col items-center gap-4">
        {/* Sound Waves Animation */}
        <div className="flex items-center gap-1 h-4">
          {[12, 20, 8, 24, 16, 28, 14, 22, 10].map((h, i) => (
            <span
              key={i}
              className="w-1 bg-emerald-400/80 rounded-full animate-bounce"
              style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 bg-black/50 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 shadow-2xl">
          {/* Mute Mic */}
          <button
            onClick={() => setMicMuted(prev => !prev)}
            className={`p-3.5 rounded-full transition-transform active:scale-90 ${
              micMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="كتم الميكروفون"
          >
            {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={() => setVideoDisabled(prev => !prev)}
            className={`p-3.5 rounded-full transition-transform active:scale-90 ${
              videoDisabled ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="إيقاف الفيديو"
          >
            {videoDisabled ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </button>

          {/* End Call Button (Big Red) */}
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition-transform"
            title="إنهاء المكالمة"
          >
            <PhoneOff className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Speaker */}
          <button
            onClick={() => setSpeakerOn(prev => !prev)}
            className={`p-3.5 rounded-full transition-transform active:scale-90 ${
              speakerOn ? 'bg-white/10 text-emerald-400' : 'bg-white/5 text-white/50'
            }`}
            title="مكبر الصوت"
          >
            {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Chat Shortcut */}
          <button
            onClick={() => navigate(`/chat/${otherUser.id}`)}
            className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-90"
            title="فتح الدردشة"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
