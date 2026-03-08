import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { getNotifications, markAllAsRead, type Notification } from "../api/notificationApi";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getNotifications(user.id);
      setNotifications(res.data.data);
      setHasUnread(res.data.data.some(n => !n.is_read));
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    let cancelled = false;

    const fetchOnce = async () => {
      if (!user) return;
      try {
        const res = await getNotifications(user.id);
        if (cancelled) return;
        setNotifications(res.data.data);
        setHasUnread(res.data.data.some(n => !n.is_read));
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    fetchOnce();

    const interval = setInterval(() => {
      fetchOnce();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoaded, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleBellClick = async () => {
    if (!user) return;

    setIsOpen(!isOpen);

    if (!isOpen && hasUnread) {
      try {
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setHasUnread(false);
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 hover:bg-zinc-800 rounded-lg transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-zinc-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute right-4 sm:right-0 top-14 sm:top-12 w-[calc(100vw-2rem)] sm:w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg max-h-96 overflow-y-auto z-100">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-bold text-white">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No notifications yet
            </div>
          ) : (
            <div className="py-2">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={() => setIsOpen(false)}
                  onRefresh={loadNotifications}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}