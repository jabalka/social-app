"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";

interface ModalContextType {
  isInModal: boolean;
  setIsInModal: (value: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  isInModal: false,
  setIsInModal: () => {},
});

export const useModalContext = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
  isModal?: boolean;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ 
  children, 
  isModal = false 
}) => {
  const [isInModal, setIsInModal] = useState(isModal);

  return (
    <ModalContext.Provider value={{ isInModal, setIsInModal }}>
      {children}
    </ModalContext.Provider>
  );
};