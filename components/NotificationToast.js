import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationToast() {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  // Afficher seulement les 3 dernières notifications non lues
  const visibleNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
      default:
        return Info;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          icon: 'text-green-400',
          text: 'text-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          icon: 'text-red-400',
          text: 'text-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          icon: 'text-yellow-400',
          text: 'text-yellow-100'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          icon: 'text-blue-400',
          text: 'text-blue-100'
        };
    }
  };

  const handleClose = (notification) => {
    markAsRead(notification.id);
    removeNotification(notification.id);
  };

  const handleClick = (notification) => {
    markAsRead(notification.id);
    if (notification.action) {
      notification.action();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => {
          const Icon = getIcon(notification.type);
          const colors = getColors(notification.type);

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: index * 0.05
              }}
              className="pointer-events-auto"
            >
              <div
                className={`${colors.bg} ${colors.border} border backdrop-blur-md rounded-2xl p-4 shadow-2xl max-w-sm min-w-[320px] cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => handleClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${colors.icon}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <h4 className="text-white font-semibold mb-1 text-sm">
                        {notification.title}
                      </h4>
                    )}
                    {notification.message && (
                      <p className={`${colors.text} text-sm leading-relaxed`}>
                        {notification.message}
                      </p>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose(notification);
                    }}
                    className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar pour auto-dismiss */}
                {notification.duration > 0 && (
                  <motion.div
                    className={`mt-3 h-1 rounded-full ${colors.bg}`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: notification.duration / 1000, ease: 'linear' }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
