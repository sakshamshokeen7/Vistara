import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  PaginatedNotifications,
} from "../services/notificationService";
import { useNotificationSocket } from "../utils/useNotificationsocket";

interface Notification {
  id: number;
  message: string;
  actor_name: string;
  is_read: boolean;
  created_at: string;
  photo_id?: number;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const loadNotifications = async (page: number) => {
    setIsLoading(true);
    try {
      const data: PaginatedNotifications = await getNotifications(page);
      if (page === 1) {
        setNotifications(data.results);
      } else {
        setNotifications((prev) => [...prev, ...data.results]);
      }
      setCurrentPage(page);
      setTotalCount(data.count);
      setHasNextPage(data.next !== null);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadNotifications(currentPage + 1);
    // Scroll to bottom of notification list after loading more
    setTimeout(() => {
      const notificationDropdown = document.querySelector(".notification-dropdown");
      if (notificationDropdown) {
        notificationDropdown.scrollTop = notificationDropdown.scrollHeight;
      }
    }, 100);
  };

  useNotificationSocket((data) => {
    setNotifications((prev) => [data, ...prev]);
    setTotalCount((prev) => prev + 1);
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown absolute right-0 mt-3 w-80 bg-slate-900 text-white rounded shadow-xl z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="p-3 text-gray-400">No notifications</div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleRead(n.id)}
              className={`p-3 border-b border-slate-700 cursor-pointer ${
                n.is_read ? "opacity-60" : "bg-slate-800"
              }`}
            >
              <div className="font-semibold">{n.actor_name}</div>
              <div className="text-sm">{n.message}</div>
              <div className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}

          {hasNextPage && (
            <div className="p-3 border-t border-slate-700 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 disabled:opacity-50 text-sm"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
              <div className="text-xs text-gray-500 mt-1">
                Showing {notifications.length} of {totalCount}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
