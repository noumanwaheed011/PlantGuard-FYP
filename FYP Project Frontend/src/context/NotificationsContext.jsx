import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);
const STORAGE_KEY = 'plantguard_notifications';

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.read).length);
      }
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setUnreadCount(0);
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: `n${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type,
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setUnreadCount((prev) => prev + 1);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
        addNotification,
        loading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
