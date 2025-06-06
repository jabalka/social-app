"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface UserDialogContextType {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const UserDialogContext = createContext<UserDialogContextType | undefined>(undefined);

export const useUserDialog = () => {
  const ctx = useContext(UserDialogContext);
  if (!ctx) throw new Error("useUserDialog must be used within a UserDialogProvider");
  return ctx;
};

export const UserDialogProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UserDialogContext.Provider value={{ selectedUserId, setSelectedUserId, isOpen, setIsOpen }}>
      {children}
    </UserDialogContext.Provider>
  );
};
