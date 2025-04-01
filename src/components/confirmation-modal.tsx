"use client";

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
  const { isOpen, content, onConfirm, onCancel } = modalProps;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent aria-describedby="confirmation-content">
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>Please confirm that you want to proceed with this action.</DialogDescription>
        </DialogHeader>
        <div className="py-4" id="confirmation-content">
          {content}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
