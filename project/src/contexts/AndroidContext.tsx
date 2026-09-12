import React, { createContext, useContext, useState, useEffect } from 'react';

interface ToastData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  time?: string;
}

interface AndroidContextType {
  currentTime: string;
  batteryLevel: number;
  wifiEnabled: boolean;
  toggleWifi: () => void;
  bluetoothEnabled: boolean;
  toggleBluetooth: () => void;
  flashlightEnabled: boolean;
  toggleFlashlight: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isQuickOpen: boolean;
  setQuickOpen: (open: boolean) => void;
  toast: ToastData | null;
  showToast: (title: string, body: string, icon?: string) => void;
  clearToast: () => void;
  cartCount: number;
  refreshCartCount: () => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  unreadMessagesCount: number;
}

const AndroidContext = createContext<AndroidContextType | undefined>(undefined);

export const AndroidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [batteryLevel] = useState<number>(94);
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true);
  const [flashlightEnabled, setFlashlightEnabled] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isQuickOpen, setQuickOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [cartCount, setCartCount] = useState<number>(1);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);
  const [unreadMessagesCount] = useState<number>(2);

  // Update real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleWifi = () => setWifiEnabled(prev => !prev);
  const toggleBluetooth = () => setBluetoothEnabled(prev => !prev);
  const toggleFlashlight = () => setFlashlightEnabled(prev => !prev);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const showToast = (title: string, body: string, icon?: string) => {
    const id = Date.now().toString();
    setToast({ id, title, body, icon, time: 'الآن' });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const clearToast = () => setToast(null);

  const refreshCartCount = async () => {
    try {
      const res = await fetch('/api/cart?user_id=usr_ahmed');
      if (res.ok) {
        const data = await res.json();
        const total = (data || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
        setCartCount(total);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    refreshCartCount();
  }, []);

  return (
    <AndroidContext.Provider
      value={{
        currentTime,
        batteryLevel,
        wifiEnabled,
        toggleWifi,
        bluetoothEnabled,
        toggleBluetooth,
        flashlightEnabled,
        toggleFlashlight,
        isDarkMode,
        toggleDarkMode,
        isQuickOpen,
        setQuickOpen,
        toast,
        showToast,
        clearToast,
        cartCount,
        refreshCartCount,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        unreadMessagesCount,
      }}
    >
      {children}
    </AndroidContext.Provider>
  );
};

export const useAndroid = () => {
  const context = useContext(AndroidContext);
  if (!context) throw new Error('useAndroid must be used within an AndroidProvider');
  return context;
};
