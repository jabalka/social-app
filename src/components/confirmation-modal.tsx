"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import GlowingPinkButton from "./glowing-pink-button";
import GlowingGreenButton from "./glowing-green-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ConfirmationModal: React.FC = () => {
  const { modalProps } = useConfirmation();
  const { theme } = useSafeThemeContext();

  const {
    isOpen,
    content,
    onConfirm,
    onCancel,
    title = "Confirm Action",
    description = "Please confirm that you want to proceed with this action.",
    confirmText = "Confirm",
    cancelText = "Cancel",
  } = modalProps;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent aria-describedby="confirmation-content">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content && <div className="py-4" id="confirmation-content">{content}</div>}
        <DialogFooter>
          <GlowingPinkButton onClick={onCancel}>
            {cancelText}
          </GlowingPinkButton>
          <GlowingGreenButton onClick={onConfirm} theme={theme}>
            {confirmText}
          </GlowingGreenButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;