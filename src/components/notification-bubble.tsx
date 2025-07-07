import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { useEffect, useRef, useState } from "react";
import NotificationBubbleItem from "./notification-bubble-item";
import { Notification, useNotifications } from "@/context/notifications-context";
import { showCustomToast } from "@/utils/show-custom-toast";

const NotificationBubble = () => {
    const { notifications, markNotificationRead } = useNotifications();
  const { theme } = useSafeThemeContext();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [undoNotification, setUndoNotification] = useState<Notification | null>(null);
  const [finalizeTimer, setFinalizeTimer] = useState<NodeJS.Timeout | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [removedNotifications, setRemovedNotifications] = useState<Notification[]>([]);

  const unread = notifications
  .filter((n) => !n.read)
  .filter((n) => !removedNotifications.some((r) => r.id === n.id));
  const unreadCount = unread.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (pendingRemove && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [pendingRemove, countdown]);

  const handleMarkAsRead = (id: string) => {
    setPendingRemove(id);
    setCountdown(3);
  
    // Save notification for undo
    const notification = unread.find((n) => n.id === id);
    setUndoNotification(notification ?? null);
  
    // After 3s, hide notification and show toast
    const timer = setTimeout(() => {
      setPendingRemove(null);
      setUndoTimer(null);
      setCountdown(3);
  
      // Actually remove from UI
      if (notification) {
        setRemovedNotifications((prev) => [...prev, notification]);
      }
  
      // Show toast with Undo button for another 3s
      showCustomToast("Notification erased", {
        action: {
          label: "Undo",
          onClick: handleUndo,
        },
      });
  
      // After another 3s, finalize removal if not undone
      const finalize = setTimeout(() => {
        // Only now, after 6s, mark as read in DB/state
        markNotificationRead(id);
        setUndoNotification(null);
        setFinalizeTimer(null);
        setRemovedNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
      setFinalizeTimer(finalize);
  
    }, 3000);
    setUndoTimer(timer);
  };
  
  const handleUndo = () => {
    if (undoTimer) clearTimeout(undoTimer);
    if (finalizeTimer) clearTimeout(finalizeTimer);
    setPendingRemove(null);
    setUndoTimer(null);
    setCountdown(3);
  
    // Restore notification to UI
    if (undoNotification) {
      setRemovedNotifications((prev) => prev.filter((n) => n.id !== undoNotification.id));
    }
    setUndoNotification(null);
  };

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  // Group notifications by type
  const grouped = unread.reduce<Record<string, typeof unread>>((acc, n) => {
    acc[n.type] = acc[n.type] || [];
    acc[n.type].push(n);
    return acc;
  }, {});




  //   const handleReview = (n: Notification) => {
  //     setReviewedNotification(n);
  //     // if (n.target.type === "project" && n.target.projectId) {
  //     //   window.location.href = `/projects/${n.target.projectId}`;
  //     // } else if (n.target.type === "idea" && n.target.ideaId) {
  //     //   window.location.href = `/browse/${n.target.ideaId}`;
  //     // } else if (n.target.type === "comment" && n.target.projectId && n.target.commentId) {
  //     //   window.location.href = `/projects/${n.target.projectId}?comment=${n.target.commentId}`;
  //     // } else {
  //     //   alert("No target to review.");
  //     // }
  //   };

  return (
    <div className={cn("relative")} ref={ref}>
      <button className="relative p-2" aria-label="Notifications" onClick={() => setOpen((v) => !v)}>
        <svg width={24} height={24} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 2a6 6 0 0 0-6 6v3c0 .7-.3 1.4-.8 1.9L4 15h16l-1.2-2.1A2.7 2.7 0 0 1 18 11V8a6 6 0 0 0-6-6z"
            stroke="currentColor"
            strokeWidth={2}
          />
          <circle cx={12} cy={19} r={2} fill="currentColor" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        
          <div
            className={cn("absolute right-0 z-50 mt-2 w-96 rounded-lg border px-2 pb-3 shadow-lg overflow-hidden", {
              "bg-[#a08f88] text-[#050505]": theme === Theme.LIGHT,
              "bg-[#413c3a]": theme === Theme.DARK,
            })}
          >
            <div className="p-3 font-semibold">Notifications</div>
            {unreadCount === 0 && <div className="p-4 text-center text-sm">No new notifications</div>}
            {Object.entries(grouped).map(([type, items]) => {
              // Capitalize and replace 'collab' with 'collaboration' for the type label
              let displayType = type.replace("-", " ").toUpperCase();
              if (displayType.startsWith("COLLAB ")) {
                displayType = displayType.replace("COLLAB ", "COLLABORATION ");
              } else if (displayType === "COLLAB") {
                displayType = "COLLABORATION";
              }
              return (
                <div key={type} className="rounded-lg border border-white my-[5px]">
                  <div className="rounded-lg bg-[#312d2c] px-4 py-2 text-xs font-bold uppercase text-gray-200">
                    {displayType}
                  </div>
                  {items.map((n) => (
                    <NotificationBubbleItem
                      key={n.id}
                      notification={n}
                      pendingRemove={pendingRemove}
                      handleUndo={handleUndo}
                      handleMarkAsRead={handleMarkAsRead}
                      countdown={pendingRemove === n.id ? countdown : undefined}
                      // handleReview={handleReview} // Uncomment if review functionality is implemented
                    />
                  ))}
                </div>
              );
            })}
            <span
              key={animationKey}
              className={cn("pointer-events-none absolute -inset-[0px] z-20 rounded-lg", {
                "animate-snakeBorderHoverLight": theme === Theme.LIGHT,
                "animate-snakeBorderHoverDark": theme === Theme.DARK,
              })}
            />
          </div>
    
      )}
    </div>
  );
};

export default NotificationBubble;
