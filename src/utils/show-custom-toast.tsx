import CustomToast from "@/components/custom-toast";
import { TOASTER_DURATION_MS } from "@/constants";
import toast, { Toast } from "react-hot-toast";

export function showCustomToast(
  message: string,
  options?: {
    action?: {
      label: string;
      onClick: () => void;
    };
  },
  id = "draft-toast",
  itemId?: string,
) {
  if (itemId) {
    sessionStorage.setItem("lastCreatedItemId", itemId);
  }

  const modifiedOptions =
    options && options.action
      ? {
          ...options,
          action: {
            ...options.action,
            onClick: () => {
              options.action!.onClick();
              if (itemId) {
                sessionStorage.removeItem("lastCreatedItemId");
              }
            },
          },
        }
      : options;

  toast.custom((t: Toast) => <CustomToast t={t} message={message} action={modifiedOptions?.action} />, {
    id,
    duration: TOASTER_DURATION_MS,
  });
}
