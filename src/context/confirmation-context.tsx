"use client";

import { createContext, ReactNode, useCallback, useState } from "react";

export type ConfirmationOptions = {
  content?: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmationContextType = {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  modalProps: ConfirmationOptions & {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
};

export const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [modalProps, setModalProps] = useState({
    isOpen: false,
    content: null as ReactNode | null,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalProps({
        isOpen: true,
        content: options.content || null,
        title: options.title || "Confirm Action",
        description: options.description || "Please confirm that you want to proceed with this action.",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        onConfirm: () => {
          setModalProps((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalProps((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return <ConfirmationContext.Provider value={{ confirm, modalProps }}>{children}</ConfirmationContext.Provider>;
}
