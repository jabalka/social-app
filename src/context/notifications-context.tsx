"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  target: {
    id: string;
    type: "project" | "idea" | "comment";
    projectId?: string;
    ideaId?: string;
    commentId?: string;
  };
  createdAt?: string;
  fromUserId?: string;
  targetId?: string;
  targetType: "project" | "idea" | "comment";
}

interface NotificationsContextValue {
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  addNotification: () => {},
  markNotificationRead: async () => {},
  refetchNotifications: async () => {},
});

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const { data } = await res.json();
      setNotifications(data);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback((n: Notification) => {
    setNotifications((prev) => [n, ...prev]);
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, markNotificationRead, refetchNotifications: fetchNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
