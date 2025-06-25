"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
    DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmation } from "@/hooks/use-confirmation.hook";

export function ConfirmationModal() {
  const { modalProps } = useConfirmation();
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
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
