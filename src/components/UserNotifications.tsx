import { useState } from "react";
import { BiSolidBell } from "react-icons/bi";

type NotificationType = {
  message: string;
  is_read: boolean;
  time: string;
};

const notifications: NotificationType[] = [
  {
    message: "your card grade have been upgraded to B",
    is_read: false,
    time: "20 jul 2025"
  },
  {
    message: "your card grade have been upgraded to B",
    is_read: false,
    time: "20 jul 2025"
  },
  {
    message: "your card grade have been upgraded to B",
    is_read: true,
    time: "20 jul 2025"
  }
];

export default function UserNotification() {
  const [isActive, setIsActive] = useState(false);
  
  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  const handleMarkAsRead = (index: number) => {
    // In a real app, you would update the notification state or call an API
    // For now, just log the action
    console.log(`Marking notification ${index} as read`);
  };

  const handleMarkAllAsRead = () => {
    // In a real app, you would update all notifications or call an API
    console.log("Marking all notifications as read");
    setIsActive(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsActive(true)} 
        className="relative cursor-pointer h-10 w-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
      >
        {unreadCount > 0 && (
          <div className="bg-red-500 text-sm text-white rounded-full w-5 h-5 absolute -top-1 right-0 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
        <BiSolidBell className="text-2xl" />
      </button>

      <div 
        onClick={() => setIsActive(false)} 
        className={`${
          isActive ? "fixed" : "hidden"
        } top-0 left-0 right-0 bottom-0 bg-black/20 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center z-50`}
      >
        <div 
          className="max-w-96 md:max-w-[500px] border border-neutral-200 dark:border-neutral-700 rounded bg-neutral-100 dark:bg-neutral-800 p-4" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-1 max-h-[500px] overflow-auto">
            {notifications.length === 0 ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                No notifications
              </div>
            ) : (
              notifications.map((notification, i) => (
                <div 
                  key={i} 
                  className={`border border-neutral-200 dark:border-neutral-700 p-4 dark:text-neutral-100 rounded cursor-pointer transition-colors ${
                    !notification.is_read 
                      ? "font-medium bg-neutral-200 dark:bg-neutral-700/50 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600/50" 
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                  }`}
                  onClick={() => handleMarkAsRead(i)}
                >
                  <p>{notification.message}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {notification.time}
                  </p>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}