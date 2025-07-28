import { showCustomToast } from "@/utils/show-custom-toast"; // or import { toast } from "react-hot-toast"
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  action?: ToastAction;
  id?: string;
}

interface ToastData {
  message: string;
  itemId?: string; // New property for storing created item IDs
}

/**
 * Shows a toast if sessionStorage flag is set, then clears the flag.
 *
 * @param key sessionStorage key to check (e.g. "showDraftToast")
 * @param message message to show, or function (flagValue) => message
 * @param options optional toast type/id/options
 */
export function useSessionToast(
  key: string,
  message: string | ((flagValue: string) => string),
  options?: string | ToastOptions, // depends on your showCustomToast implementation
) {
  const pathname = usePathname();
  const shownRef = useRef(false);

  const processOptions = (itemId?: string): ToastOptions => {
    if (typeof options === "string") {
      return { id: options };
    }
    if (itemId && options?.action) {
      const originalOnClick = options.action.onClick;
      return {
        ...options,
        action: {
          ...options.action,
          onClick: () => {
            // Store the ID for the component to use
            sessionStorage.setItem("lastCreatedItemId", itemId);
            originalOnClick();
          },
        },
      };
    }

    return options || {};
  };

  const showToastIfNeeded = () => {
    const flagValue = sessionStorage.getItem(key);
    if (!flagValue) return;

    try {
      // Try to parse as JSON to get both message and itemId
      const data = JSON.parse(flagValue) as ToastData;
      const msg = typeof message === "function" ? message(data.message) : data.message || message;
      const opts = processOptions(data.itemId);

      showCustomToast(
        msg,
        {
          action: opts.action,
        },
        opts.id || key,
      );
    } catch {
      // If not JSON, treat as simple string (backward compatibility)
      const msg = typeof message === "function" ? message(flagValue) : message;
      const opts = processOptions();

      showCustomToast(
        msg,
        {
          action: opts.action,
        },
        opts.id || key,
      );
    }

    sessionStorage.removeItem(key);
  };

  // Show on mount
  useEffect(() => {
    showToastIfNeeded();
    // eslint-disable-next-line
  }, [key, message, options]);

  // Show on path change, with duplicate prevention
  useEffect(() => {
    if (shownRef.current) return;

    showToastIfNeeded();
    shownRef.current = true;

    // Reset for future path changes
    setTimeout(() => {
      shownRef.current = false;
    }, 500);

    // eslint-disable-next-line
  }, [pathname, key, message, options]);
}
