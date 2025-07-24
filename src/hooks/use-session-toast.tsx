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

  const processOptions = (): ToastOptions => {
    if (typeof options === "string") {
      return { id: options };
    }
    return options || {};
  };

  useEffect(() => {
    const flagValue = sessionStorage.getItem(key);
    if (flagValue) {
      const msg = typeof message === "function" ? message(flagValue) : message;
      const opts = processOptions();

      showCustomToast(
        msg,
        {
          action: opts.action,
        },
        opts.id || key,
      );

      sessionStorage.removeItem(key);
    }
        // eslint-disable-next-line
  }, [key, message, options]);

  useEffect(() => {
    // Only show toast ONCE per path (prevents duplicate on re-render)
    if (shownRef.current) return;
    const flagValue = sessionStorage.getItem(key);
    if (flagValue) {
      const msg = typeof message === "function" ? message(flagValue) : message;
      const opts = processOptions();

      showCustomToast(
        msg,
        {
          action: opts.action,
        },
        opts.id || key,
      );

      sessionStorage.removeItem(key);
      shownRef.current = true;
      // Reset for future path changes
      setTimeout(() => {
        shownRef.current = false;
      }, 500); // small delay to allow future toasts on further navigations
    }
    // reset shownRef when path changes
    // eslint-disable-next-line
  }, [pathname, key, message, options]);
}
