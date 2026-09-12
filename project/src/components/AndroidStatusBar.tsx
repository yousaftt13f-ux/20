import React from 'react';
import { useAndroid } from '../contexts/AndroidContext';
import { Wifi, Battery, Volume2, ShieldCheck, ChevronDown } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const { currentTime, batteryLevel, wifiEnabled, setQuickOpen } = useAndroid();

  return (
    <header
      onClick={() => setQuickOpen(true)}
      className="h-9 pt-1 px-5 flex items-center justify-between text-xs select-none cursor-pointer z-50 text-white/90 bg-transparent hover:bg-white/5 transition-colors group"
      title="اسحب أو اضغط للوصول إلى لوحة التحكم السريعة"
    >
      {/* Time & Android Notification Indicator */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-xs tracking-wide">{currentTime}</span>
        <div className="flex items-center gap-1 opacity-70">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <div className="w-3.5 h-3.5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-[9px] font-black">
            12
          </div>
        </div>
      </div>

      {/* Pull down indicator handle */}
      <div className="opacity-0 group-hover:opacity-70 transition-opacity flex items-center gap-1 text-[10px] text-white/50">
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </div>

      {/* Status Icons: 5G, Wi-Fi, Sound, Battery */}
      <div className="flex items-center gap-2 text-white/90">
        <span className="text-[10px] font-bold tracking-tight text-white/70">5G</span>
        {wifiEnabled ? (
          <Wifi className="w-3.5 h-3.5 text-white/90" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <Volume2 className="w-3.5 h-3.5 text-white/70" />
        <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-full">
          <span className="text-[10px] font-semibold">{batteryLevel}%</span>
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    </header>
  );
};

export default AndroidStatusBar;
