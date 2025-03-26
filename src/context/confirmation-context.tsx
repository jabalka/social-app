"use client";

import { createContext, ReactNode, useCallback, useState } from "react";

type ConfirmationContextType = {
  confirm: (content: ReactNode) => Promise<boolean>;
  modalProps: {
    isOpen: boolean;
    content: ReactNode | null;
    onConfirm: () => void;
    onCancel: () => void;
  };
};

export const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [modalProps, setModalProps] = useState({
    isOpen: false,
    content: null as ReactNode | null,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((content: ReactNode): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalProps({
        isOpen: true,
        content,
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
