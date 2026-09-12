import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAndroid } from '../contexts/AndroidContext';
import {
  Download,
  Smartphone,
  FileCode2,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useAndroid();

  const [downloadingApk, setDownloadingApk] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    showToast('بدء التحميل', 'جاري تنزيل ملف app12-v2.4.apk...');

    // Trigger download
    const link = document.createElement('a');
    link.href = '/downloads/app12-v2.4.apk';
    link.download = 'app12-v2.4.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingApk(false);
      showToast('اكتمل التنزيل! 📱', 'تم حفظ ملف APK بنجاح، يمكنك تثبيته الآن');
    }, 2000);
  };

  const handleDownloadSourceZip = () => {
    setDownloadingZip(true);
    showToast('بدء التحميل', 'جاري تصدير حزمة الكود المصدري الكامل app12-source.zip...');

    const link = document.createElement('a');
    link.href = '/downloads/app12-source.zip';
    link.download = 'app12-source.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingZip(false);
      showToast('اكتمل التحميل! 📦', 'تم تنزيل كود المصدر الكامل للمشروع (ZIP)');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Top Header */}
      <div className="p-3.5 bg-neutral-900 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-base text-white">مركز تنزيل تطبيق 12</h2>
        </div>
        <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
          الإصدار 2.4.0
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 p-4 space-y-4">
        {/* Hero Card */}
        <div className="rounded-3xl bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 p-5 text-white shadow-xl shadow-rose-600/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 font-black text-xl flex items-center justify-center mb-3 shadow-lg">
              12
            </div>
            <h3 className="text-lg font-black mb-1">تطبيق 12 لنظام أندرويد</h3>
            <p className="text-xs text-white/90 leading-relaxed mb-4">
              الشبكة الاجتماعية العربية المتكاملة: منشورات، فيديوهات، مكالمات فيديو مباشرة، كاميرا
              وفلاتر، متجر متطور، وتصميم مريح لليد الواحدة.
            </p>

            <div className="flex flex-wrap gap-2 text-[10px] text-white/80">
              <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" /> موقّع رقمياً
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" /> أندرويد 8.0 فما فوق
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" /> متوافق مع جميع الهواتف
              </span>
            </div>
          </div>
        </div>

        {/* Download Option 1: Native APK Package */}
        <div className="bg-neutral-900 rounded-3xl p-4 border border-white/10 hover:border-rose-500/40 transition-all shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>حزمة أندرويد الرسمية (APK)</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">
                    APK
                  </span>
                </h4>
                <p className="text-[11px] text-white/50">app12-v2.4.apk • 48.6 ميجابايت</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/70 leading-relaxed mb-4">
            ملف APK أصلي قابل للتثبيت مباشرة على أي جهاز أندرويد. يشمل جميع ميزات الشبكة والكاميرا
            والمكالمات الفورية والتحكم السريع.
          </p>

          <button
            onClick={handleDownloadApk}
            disabled={downloadingApk}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingApk ? 'جاري تجهيز التحميل...' : 'تنزيل ملف APK المباشر'}</span>
          </button>
        </div>

        {/* Download Option 2: Full Source Code ZIP */}
        <div className="bg-neutral-900 rounded-3xl p-4 border border-white/10 hover:border-rose-500/40 transition-all shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <FileCode2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>كود المصدر الكامل للمشروع (ZIP)</span>
                  <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-black">
                    ZIP
                  </span>
                </h4>
                <p className="text-[11px] text-white/50">app12-source.zip • المشروع الكامل</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/70 leading-relaxed mb-4">
            أرشيف ZIP كامل يحتوي على جميع ملفات الواجهة الأمامية React + TypeScript ومسارات خوادم Vercel
            Serverless ومخطط قاعدة بيانات Supabase وإعدادات Vite.
          </p>

          <button
            onClick={handleDownloadSourceZip}
            disabled={downloadingZip}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingZip ? 'جاري ضغط الملفات...' : 'تنزيل سورس كود المشروع (ZIP)'}</span>
          </button>
        </div>

        {/* Installation Instructions */}
        <div className="bg-neutral-900 rounded-3xl p-4 border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>طريقة تثبيت ملف APK على أجهزة أندرويد</span>
          </h4>

          <div className="space-y-2 text-[11px] text-white/70">
            <div className="flex items-start gap-2 bg-white/5 p-2 rounded-xl">
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                1
              </span>
              <span>اضغط على زر تنزيل ملف APK لحفظ الملف في مجلد التنزيلات.</span>
            </div>

            <div className="flex items-start gap-2 bg-white/5 p-2 rounded-xl">
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                2
              </span>
              <span>
                افتح الملف بعد اكتمال التنزيل واضغط على "تثبيت" (إذا ظهرت رسالة مصادر غير معروفة، اضغط
                سماح).
              </span>
            </div>

            <div className="flex items-start gap-2 bg-white/5 p-2 rounded-xl">
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black flex-shrink-0">
                3
              </span>
              <span>افتح تطبيق 12 واستمتع بجميع الميزات الاجتماعية ومكالمات الفيديو الفورية!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
