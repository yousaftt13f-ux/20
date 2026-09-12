import React from 'react';
import { useAndroid } from '../contexts/AndroidContext';
import { Bell, X } from 'lucide-react';

export const AndroidToast: React.FC = () => {
  const { toast, clearToast } = useAndroid();

  if (!toast) return null;

  return (
    <div
      onClick={clearToast}
      className="fixed top-12 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[200] cursor-pointer animate-slideDown"
    >
      <div className="bg-neutral-900/95 text-white backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-2xl">
        {/* App 12 Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center font-black text-white text-sm shadow-md flex-shrink-0">
          12
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
              <Bell className="w-3 h-3" /> تطبيق 12
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearToast();
              }}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-xs font-bold text-white truncate">{toast.title}</h4>
          <p className="text-[11px] text-white/70 truncate">{toast.body}</p>
        </div>
      </div>
    </div>
  );
};

export default AndroidToast;
