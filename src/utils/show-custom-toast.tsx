import CustomToast from "@/components/custom-toast";
import { TOASTER_DURATION_MS } from "@/constants";
import toast, { Toast } from "react-hot-toast";

export function showCustomToast(message: string, options?: { action?: { label: string; onClick: () => void } }, id = "draft-toast") {
  toast.custom((t: Toast) => <CustomToast t={t} message={message} action={options?.action} />, {
    id,
    duration: TOASTER_DURATION_MS,
  });
}
