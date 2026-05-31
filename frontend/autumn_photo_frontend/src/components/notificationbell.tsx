import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  type PaginatedNotifications,
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
        className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 transition-all duration-150 relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-xs font-sans font-medium px-1.5 rounded-full text-white text-[10px] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown absolute right-0 mt-3 w-80 bg-[#111111] text-white rounded-xl border border-white/[0.08] shadow-2xl z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="p-4 font-sans text-body text-neutral-600 text-center">No notifications</div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleRead(n.id)}
              className={`p-3 border-b border-white/[0.05] cursor-pointer transition-all duration-150 ${
                n.is_read ? "opacity-60 hover:opacity-100" : "bg-blue-500/[0.06] hover:bg-blue-500/[0.1]"
              }`}
            >
              <div className="font-sans font-medium text-sm text-neutral-200">{n.actor_name}</div>
              <div className="font-sans text-body text-neutral-400 mt-1">{n.message}</div>
              <div className="font-sans text-body text-neutral-600 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}

          {hasNextPage && (
            <div className="p-3 border-t border-white/[0.05] text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="font-sans text-btn text-blue-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
              <div className="font-sans text-body text-neutral-600 mt-2">
                Showing {notifications.length} of {totalCount}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
