import React from "react";
import { Undo2, Check, Eye } from "lucide-react";

export interface Notification {
    id: string;
    message: string;
}

interface NotificationBubbleItemProps {
    notification: Notification;
    pendingRemove?: string | number | null;
    handleUndo: () => void;
    handleMarkAsRead: (id: string) => void;
    handleReview?: (notification: Notification) => void;
    countdown?: number;
}

const NotificationBubbleItem: React.FC<NotificationBubbleItemProps> = ({
    notification: n,
    pendingRemove,
    handleUndo,
    handleMarkAsRead,
    handleReview,
    countdown,
}) => (
    <div className="flex items-center justify-between border-b px-4 py-2 last:border-b-0">
        <span className="text-sm">{n.message}</span>
        <div className="flex gap-2">
            {pendingRemove === n.id ? (
                <button
                    className="flex h-8 w-8 items-center justify-center rounded bg-yellow-600 hover:bg-yellow-400 relative"
                    onClick={handleUndo}
                    title="Undo"
                    type="button"
                >
                    <Undo2 size={18} />
                    <span className="ml-2 text-xs font-bold">{countdown ?? 3}</span>
                </button>
            ) : (
                <button
                    className="flex h-8 w-8 items-center justify-center rounded bg-green-600 hover:bg-green-400"
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                    type="button"
                >
                    <Check size={18} />
                </button>
            )}
            <button
                className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 hover:bg-blue-400"
                onClick={() =>
                    handleReview
                        ? handleReview(n)
                        : console.log("Reviewing notification:", n)
                }
                title="Review"
                type="button"
            >
                <Eye size={18} />
            </button>
        </div>
    </div>
);

export default NotificationBubbleItem;