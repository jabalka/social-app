"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import GlowingPinkButton from "./shared/glowing-pink-button";
import GlowingGreenButton from "./shared/glowing-green-button";
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
          <DialogTitle className="text-center w-full">{title}</DialogTitle>
          <DialogDescription className="pt-8 text-center w-full">
            {description}
          </DialogDescription>
        </DialogHeader>
        {content && (
          <div
            className="py-4 flex justify-center w-full"
            id="confirmation-content"
          >
            {content}
          </div>
        )}
        <DialogFooter className="flex justify-center w-full gap-4">
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