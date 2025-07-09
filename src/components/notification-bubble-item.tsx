import { Notification } from "@/context/notifications-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Eye, Trash2, Undo2 } from "lucide-react";
import React from "react";

interface NotificationBubbleItemProps {
  notification: Notification;
  pendingRemove?: string | number | null;
  handleUndo: () => void;
  handleDelete: (id: string) => void;
  handleReview?: (n: Notification) => Promise<void>;
  countdown?: number;
  isRead?: boolean;
  theme: string;
}

const NotificationBubbleItem: React.FC<NotificationBubbleItemProps> = ({
  notification: n,
  pendingRemove,
  handleUndo,
  handleDelete,
  handleReview,
  countdown,
  isRead,
  theme,
}) =>{ 
    
   return (
  <div className="flex items-center justify-between border-b px-4 py-2 last:border-b-0">
    <span
      className={cn(`text-sm`, {
        "text-gray-700": theme === Theme.LIGHT && isRead,
        "text-gray-400": theme === Theme.DARK && isRead,
      })}
    >
      {n.message}
    </span>
    <div className="flex gap-2">
      {pendingRemove === n.id ? (
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded bg-yellow-600 hover:bg-yellow-400"
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
          onClick={() => handleDelete(n.id)}
          title="Delete notification"
          type="button"
        >
          <Trash2 size={18} />
        </button>
      )}
      <button
        className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 hover:bg-blue-400"
        onClick={() => {
          if (handleReview) {
            handleReview(n);
          }}}
        title="Review Notification"
        type="button"
      >
        <Eye size={18} />
      </button>
    </div>
  </div>
)};

export default NotificationBubbleItem;
