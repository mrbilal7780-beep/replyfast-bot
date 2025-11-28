import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Ajouter une notification in-app
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: notification.type || 'info', // info, success, warning, error
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000,
      action: notification.action,
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove après duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Marquer comme lu
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Marquer tout comme lu
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Effacer toutes les notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Envoyer notification email
  const sendEmailNotification = useCallback(async (emailData) => {
    try {
      const response = await fetch('/api/send-notification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Helpers pour types communs de notifications
  const success = useCallback((title, message, options = {}) => {
    return addNotification({ type: 'success', title, message, ...options });
  }, [addNotification]);

  const error = useCallback((title, message, options = {}) => {
    return addNotification({ type: 'error', title, message, duration: 7000, ...options });
  }, [addNotification]);

  const warning = useCallback((title, message, options = {}) => {
    return addNotification({ type: 'warning', title, message, ...options });
  }, [addNotification]);

  const info = useCallback((title, message, options = {}) => {
    return addNotification({ type: 'info', title, message, ...options });
  }, [addNotification]);

  // Charger notifications depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('replyfast_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.notifications || []);
        setUnreadCount(parsed.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Error loading notifications from localStorage:', e);
    }
  }, []);

  // Sauvegarder notifications dans localStorage
  useEffect(() => {
    try {
      // Garder seulement les 50 dernières notifications
      const toSave = notifications.slice(0, 50);
      localStorage.setItem('replyfast_notifications', JSON.stringify({
        notifications: toSave,
        unreadCount
      }));
    } catch (e) {
      console.warn('Error saving notifications to localStorage:', e);
    }
  }, [notifications, unreadCount]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendEmailNotification,
    // Helpers
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
