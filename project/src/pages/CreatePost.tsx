import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  RotateCw,
  Sparkles,
  Music,
  Video,
  Image as ImageIcon,
  Check,
  X,
  Sliders,
  Send,
} from 'lucide-react';

const FILTERS = [
  { id: 'normal', name: 'عادي', style: 'none' },
  { id: 'vintage', name: 'فينتاج', style: 'sepia(40%) contrast(110%)' },
  { id: 'neon', name: 'نيون 12', style: 'saturate(200%) hue-rotate(30deg)' },
  { id: 'cinematic', name: 'سينمائي', style: 'contrast(125%) brightness(95%)' },
  { id: 'noir', name: 'أسود وأبيض', style: 'grayscale(100%) contrast(120%)' },
  { id: 'rose', name: 'روز جولد', style: 'hue-rotate(330deg) saturate(140%)' },
];

const AUDIO_TRACKS = [
  'الصوت الأصلي - تطبيق 12 أندرويد',
  'إيقاع حماسي - ترند الخليج 2026',
  'موسيقى نيون إلكترونية - ستوديو 12',
  'ألحان سينمائية هادئة',
  'نغمات الصباح والنشاط',
];

export const CreatePost: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useAndroid();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'video' | 'photo'>('photo');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);

  // Form details
  const [caption, setCaption] = useState<string>('');
  const [tags, setTags] = useState<string>('#تطبيق12 #أندرويد #محتوى_عربي');
  const [audioTitle, setAudioTitle] = useState<string>(AUDIO_TRACKS[0]);
  const [publishing, setPublishing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera initialization
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false,
          });
          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        }
      } catch {
        // Fallback placeholder if camera access denied
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const flipCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCapture = () => {
    if (mode === 'photo') {
      // Capture simulated photo from camera canvas or fallback
      setCapturedMedia('https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80');
      showToast('تم التقاط الصورة', 'يمكنك الآن كتابة الوصف ونشرها');
    } else {
      if (!isRecording) {
        setIsRecording(true);
        showToast('بدء التسجيل', 'جاري تصوير مقطع الفيديو...');
      } else {
        setIsRecording(false);
        setCapturedMedia('https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-42998-large.mp4');
        showToast('تم إيقاف التسجيل', 'تم حفظ الفيديو بنجاح');
      }
    }
  };

  const handlePublish = async () => {
    if (!caption.trim()) {
      showToast('تنبيه', 'يرجى كتابة وصف لمنشورك');
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          caption,
          media_url:
            capturedMedia ||
            (mode === 'video'
              ? 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1232-large.mp4'
              : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'),
          media_type: mode === 'video' ? 'video' : 'image',
          audio_title: audioTitle,
          tags,
        }),
      });

      if (res.ok) {
        showToast('تم النشر بنجاح! 🎉', 'منشورك متاح الآن لجميع المتابعين');
        navigate('/');
      } else {
        showToast('خطأ', 'تعذر نشر المنشور، حاول مرة أخرى');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ', 'حدث خطأ في الاتصال');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden relative text-white" dir="rtl">
      {/* Top Header */}
      <div className="p-3 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Selected Audio Badge */}
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs">
          <Music className="w-3.5 h-3.5 text-rose-400" />
          <span className="truncate max-w-[160px]">{audioTitle}</span>
        </div>

        <button
          onClick={flipCamera}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Live Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center bg-neutral-900 overflow-hidden">
        {capturedMedia ? (
          mode === 'video' ? (
            <video
              src={capturedMedia}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ filter: selectedFilter.style }}
            />
          ) : (
            <img
              src={capturedMedia}
              alt="ملتقط"
              className="w-full h-full object-cover"
              style={{ filter: selectedFilter.style }}
            />
          )
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ filter: selectedFilter.style }}
            />
            {/* Fallback visual if no camera */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
              <Camera className="w-16 h-16 text-white mb-2" />
              <p className="text-xs">كاميرا تطبيق 12 جاهزة للالتقاط</p>
            </div>
          </>
        )}

        {/* Live Recording Timer */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-mono px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>00:{recordingSeconds.toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {/* Controls Sheet / Bottom Action */}
      {!capturedMedia ? (
        <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
          {/* Filters Carousel */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                  selectedFilter.id === f.id
                    ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-black/50 border-white/10 text-white/70 hover:bg-black/70'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Shutter Button & Mode Switch */}
          <div className="flex items-center justify-around pt-2">
            {/* Select Audio */}
            <button
              onClick={() => {
                const nextIndex =
                  (AUDIO_TRACKS.indexOf(audioTitle) + 1) % AUDIO_TRACKS.length;
                setAudioTitle(AUDIO_TRACKS[nextIndex]);
                showToast('الصوت', AUDIO_TRACKS[nextIndex]);
              }}
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Music className="w-5 h-5 text-rose-400" />
            </button>

            {/* Big Shutter Trigger */}
            <button
              onClick={handleCapture}
              className={`w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all ${
                isRecording
                  ? 'border-red-500 bg-red-500/20 scale-105'
                  : 'border-white bg-white/20 active:scale-95'
              }`}
            >
              <div
                className={`transition-all ${
                  isRecording
                    ? 'w-6 h-6 rounded-md bg-red-500'
                    : mode === 'video'
                    ? 'w-12 h-12 rounded-full bg-red-500'
                    : 'w-12 h-12 rounded-full bg-white'
                }`}
              />
            </button>

            {/* Switch Mode: Photo vs Video */}
            <div className="flex flex-col gap-1 text-[11px] font-bold">
              <button
                onClick={() => setMode('photo')}
                className={`px-2 py-0.5 rounded-full ${
                  mode === 'photo' ? 'bg-rose-500 text-white' : 'text-white/60'
                }`}
              >
                صورة
              </button>
              <button
                onClick={() => setMode('video')}
                className={`px-2 py-0.5 rounded-full ${
                  mode === 'video' ? 'bg-rose-500 text-white' : 'text-white/60'
                }`}
              >
                فيديو
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Publishing Form */
        <div className="p-4 bg-neutral-900 border-t border-white/10 z-30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-white">تفاصيل المنشور الجديد</h4>
            <button
              onClick={() => setCapturedMedia(null)}
              className="text-xs text-rose-400 hover:underline"
            >
              إعادة التصوير
            </button>
          </div>

          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="اكتب وصفاً جذاباً لمنشورك..."
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-rose-500 resize-none"
          />

          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="#هاشتاج"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 text-xs text-rose-300 outline-none"
          />

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/30 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{publishing ? 'جاري النشر في 12...' : 'نشر الآن في الخلاصة'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
