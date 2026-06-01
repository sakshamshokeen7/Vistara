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
      <div
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        className="relative w-[34px] h-[34px] !p-0 rounded-[10px] bg-white/[0.04] border border-white/[0.07] text-neutral-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/25 flex items-center justify-center transition-all duration-150 cursor-pointer"
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {open && (
        <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-[#111111] border border-white/[0.08] text-[#f5f5f5] rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="p-4 text-center text-neutral-600 text-[13px]">No notifications</div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleRead(n.id)}
              className={`flex gap-3 p-4 border-b border-white/[0.05] cursor-pointer transition-all duration-150 ${
                n.is_read ? "opacity-60 bg-transparent" : "bg-blue-500/[0.05] hover:bg-blue-500/[0.08]"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-[10px] bg-white/[0.04] border border-white/[0.07] text-neutral-400 flex items-center justify-center">
                <Bell size={14} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-[13px] text-neutral-300">{n.actor_name}</div>
                <div className="text-[12px] text-neutral-600 mt-0.5">{n.message}</div>
                <div className="text-[11px] text-neutral-700 mt-1.5">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}

          {hasNextPage && (
            <div className="p-4 border-t border-white/[0.05] text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed text-[13px] font-medium transition-colors duration-150"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
              <div className="text-[11px] text-neutral-700 mt-2">
                Showing {notifications.length} of {totalCount}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
