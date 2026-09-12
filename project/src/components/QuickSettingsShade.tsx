import React from 'react';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import {
  Wifi,
  Bluetooth,
  Flashlight,
  Moon,
  Sun,
  Volume2,
  RotateCw,
  ShieldCheck,
  Settings,
  Download,
  Home,
  X,
  Sliders,
} from 'lucide-react';

export const QuickSettingsShade: React.FC = () => {
  const {
    isQuickOpen,
    setQuickOpen,
    currentTime,
    wifiEnabled,
    toggleWifi,
    bluetoothEnabled,
    toggleBluetooth,
    flashlightEnabled,
    toggleFlashlight,
    isDarkMode,
    toggleDarkMode,
  } = useAndroid();

  const navigate = useNavigate();

  if (!isQuickOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[190] animate-fadeIn"
        onClick={() => setQuickOpen(false)}
      />

      {/* Pull-down Shade panel */}
      <div className="absolute top-0 left-0 right-0 z-[195] bg-neutral-900/98 text-white rounded-b-3xl border-b border-white/10 shadow-2xl p-5 select-none animate-slideDown max-w-[430px] mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wide text-white">{currentTime}</span>
            <span className="text-white/60">السبت، 12 سبتمبر 2026</span>
          </div>
          <button
            onClick={() => setQuickOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Quick Toggles Grid */}
        <div className="grid grid-cols-4 gap-3 my-4">
          {/* Wi-Fi */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleWifi}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${
                wifiEnabled ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/10 text-white/50'
              }`}
            >
              <Wifi className="w-5 h-5" />
            </button>
            <span className="text-[11px] text-white/80 font-medium">واي فاي</span>
          </div>

          {/* Bluetooth */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleBluetooth}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${
                bluetoothEnabled ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white/10 text-white/50'
              }`}
            >
              <Bluetooth className="w-5 h-5" />
            </button>
            <span className="text-[11px] text-white/80 font-medium">بلوتوث</span>
          </div>

          {/* Dark Mode */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${
                isDarkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-amber-500 text-white'
              }`}
            >
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <span className="text-[11px] text-white/80 font-medium">{isDarkMode ? 'داكن' : 'فاتح'}</span>
          </div>

          {/* Flashlight */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleFlashlight}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${
                flashlightEnabled ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-white/10 text-white/50'
              }`}
            >
              <Flashlight className="w-5 h-5" />
            </button>
            <span className="text-[11px] text-white/80 font-medium">كشاف</span>
          </div>

          {/* Sound */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-white/80 font-medium">الصوت</span>
          </div>

          {/* Rotate */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <RotateCw className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-white/80 font-medium">تدوير تلقائي</span>
          </div>

          {/* Security */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-white/80 font-medium">حماية 12</span>
          </div>

          {/* More */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-white/80 font-medium">تحكم كامل</span>
          </div>
        </div>

        {/* Brightness Slider */}
        <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl my-3">
          <Sun className="w-4 h-4 text-white/50" />
          <input
            type="range"
            defaultValue={85}
            className="w-full accent-rose-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <Sun className="w-4 h-4 text-white" />
        </div>

        {/* Fast Action Shortcuts */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              setQuickOpen(false);
              navigate('/download');
            }}
            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl p-2.5 flex flex-col items-center gap-1 text-[11px] font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تحميل APK & ZIP</span>
          </button>

          <button
            onClick={() => {
              setQuickOpen(false);
              navigate('/notifications');
            }}
            className="bg-white/5 hover:bg-white/10 rounded-2xl p-2.5 flex flex-col items-center gap-1 text-[11px] font-medium transition-colors"
          >
            <Settings className="w-4 h-4 text-white/80" />
            <span>الإشعارات</span>
          </button>

          <button
            onClick={() => {
              setQuickOpen(false);
              navigate('/');
            }}
            className="bg-white/5 hover:bg-white/10 rounded-2xl p-2.5 flex flex-col items-center gap-1 text-[11px] font-medium transition-colors"
          >
            <Home className="w-4 h-4 text-white/80" />
            <span>الرئيسية</span>
          </button>
        </div>

        {/* Bottom Grab Bar */}
        <div
          className="mt-4 flex justify-center cursor-pointer py-1"
          onClick={() => setQuickOpen(false)}
        >
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </>
  );
};

export default QuickSettingsShade;
