import { Notification, useNotifications } from "@/context/notifications-context";
import { useProjectModal } from "@/context/project-moadal-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { showCustomToast } from "@/utils/show-custom-toast";
import { useEffect, useRef, useState } from "react";
import NotificationBubbleItem from "./notification-bubble-item";

const NotificationBubble = () => {
  const { notifications, markNotificationRead, refetchNotifications } = useNotifications();
  const { theme } = useSafeThemeContext();
  const { confirm } = useConfirmation();
  const { openProjectModal } = useProjectModal();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  //   const [undoNotification, setUndoNotification] = useState<Notification | null>(null);
  const [finalizeTimer, setFinalizeTimer] = useState<NodeJS.Timeout | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [removedNotifications, setRemovedNotifications] = useState<Notification[]>([]);

  const undoClickedRef = useRef(false);

  const unread = notifications.filter((n) => !n.read && !removedNotifications.some((r) => r.id === n.id));
  const read = notifications.filter((n) => n.read && !removedNotifications.some((r) => r.id === n.id));
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

  const handleDelete = (id: string) => {
    setPendingRemove(id);
    setCountdown(3);
    const notification = unread.find((n) => n.id === id);
    // setUndoNotification(notification ?? null);
    undoClickedRef.current = false;

    const timer = setTimeout(() => {
      setPendingRemove(null);
      setUndoTimer(null);
      setCountdown(3);
      if (notification) setRemovedNotifications((prev) => [...prev, notification]);
      showCustomToast("Notification deleted", {
        action: {
          label: "Undo",
          onClick: () => handleUndo(id),
        },
      });
      const finalize = setTimeout(async () => {
        if (!undoClickedRef.current) {
          // Call your delete API here
          await fetch(`/api/notifications/${id}`, { method: "DELETE" });
          setRemovedNotifications((prev) => prev.filter((n) => n.id !== id));
          refetchNotifications();
        }
        // setUndoNotification(null);
        setFinalizeTimer(null);
      }, 3000);
      setFinalizeTimer(finalize);
    }, 3000);
    setUndoTimer(timer);
  };

  const handleDeleteAllRead = async () => {
    const result = await confirm({
      title: "Delete all your read notifications?",
      description: "You are about to delete all your read notifications. This action cannot be undone.",
      content: "Are you sure you want to proceed?",
      confirmText: "Yes",
      cancelText: "No",
    });
    if (result) {
      for (const n of read) {
        await fetch(`/api/notifications/${n.id}`, { method: "DELETE" });
      }
      setRemovedNotifications((prev) => [...prev, ...read]);
      refetchNotifications();
    }
  };

  const handleUndo = (id?: string) => {
    undoClickedRef.current = true;
    if (undoTimer) clearTimeout(undoTimer);
    if (finalizeTimer) clearTimeout(finalizeTimer);
    setPendingRemove(null);
    setUndoTimer(null);
    setCountdown(3);

    if (id) {
      setRemovedNotifications((prev) => prev.filter((n) => n.id !== id));
    }
    // setUndoNotification(null);
    refetchNotifications();
  };

  const handleReview = async (n: Notification) => {
    if (!n.read) {
      await markNotificationRead(n.id);
      refetchNotifications();
    }
    switch (n.targetType) {
      case "project":
        if (n.targetId) {
          await openProjectModal(n.targetId);
        }
        break;
      case "idea":
        if (n.targetId) {
          // openIdeaModal(n.target.ideaId);
        }
        break;
      case "comment":
        if (n.targetId) {
          // openCommentModal(n.target.commentId);
        }
        break;
      default:
        // fallback or error
        break;
    }
  };

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  const groupByType = (arr: Notification[]) =>
    arr.reduce<Record<string, Notification[]>>((acc, n) => {
      acc[n.type] = acc[n.type] || [];
      acc[n.type].push(n);
      return acc;
    }, {});

  const groupedUnread = groupByType(unread);
  const groupedRead = groupByType(read);

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
          className={cn(
            "absolute right-0 z-50 mt-2 max-h-[460px] w-96 overflow-hidden rounded-lg border px-2 pb-3 shadow-lg",
            {
              "bg-[#a08f88] text-[#050505]": theme === Theme.LIGHT,
              "bg-[#413c3a]": theme === Theme.DARK,
            },
          )}
        >
          <div className="p-3 font-semibold">Notifications</div>
          {unreadCount === 0 && <div className="p-4 text-center text-sm">No new notifications</div>}
          {unread.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded border border-[#595b5e] pr-1">
              {Object.entries(groupedUnread).map(([type, items]) => {
                // Capitalize and replace 'collab' with 'collaboration' for the type label
                let displayType = type.replace("-", " ").toUpperCase();
                if (displayType.startsWith("COLLAB ")) {
                  displayType = displayType.replace("COLLAB ", "COLLABORATION ");
                } else if (displayType === "COLLAB") {
                  displayType = "COLLABORATION";
                }
                return (
                  <div key={type} className="my-[5px] rounded-lg border border-white">
                    <div className="rounded-lg bg-[#312d2c] px-4 py-2 text-xs font-bold uppercase text-gray-200">
                      {displayType}
                    </div>
                    {items.map((n) => (
                      <NotificationBubbleItem
                        key={n.id}
                        notification={n}
                        pendingRemove={pendingRemove}
                        handleUndo={handleUndo}
                        handleDelete={handleDelete}
                        handleReview={handleReview}
                        countdown={pendingRemove === n.id ? countdown : undefined}
                        isRead={false}
                        theme={theme}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {read.length > 0 && (
            <div className="mt-4">
              <div
                className={cn(
                  "flex items-center justify-between border-t-2 border-black px-4 py-2 text-xs font-bold uppercase",
                  {
                    "bg-[#a08f88] text-gray-600": theme === Theme.LIGHT,
                    "bg-[#413c3a] text-gray-400": theme === Theme.DARK,
                  },
                )}
              >
                Read Notifications
                <button
                  className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-500"
                  onClick={handleDeleteAllRead}
                >
                  Delete All
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto rounded border border-[#595b5e] pr-1">
                {Object.entries(groupedRead).map(([type, items]) => {
                  let displayType = type.replace("-", " ").toUpperCase();
                  if (displayType.startsWith("COLLAB ")) {
                    displayType = displayType.replace("COLLAB ", "COLLABORATION ");
                  } else if (displayType === "COLLAB") {
                    displayType = "COLLABORATION";
                  }

                  return (
                    <div key={type} className="my-[5px] rounded-lg border border-gray-600">
                      <div className="rounded-lg bg-[#312d2c] px-4 py-2 text-xs font-bold uppercase text-gray-400">
                        {type.replace("-", " ").toUpperCase()}
                      </div>
                      {items.map((n) => (
                        <NotificationBubbleItem
                          key={n.id}
                          notification={n}
                          pendingRemove={pendingRemove}
                          handleUndo={handleUndo}
                          handleDelete={handleDelete}
                          handleReview={handleReview}
                          countdown={pendingRemove === n.id ? countdown : undefined}
                          isRead={true}
                          theme={theme}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
