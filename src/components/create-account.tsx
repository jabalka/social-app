"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateAccountDialog from "./create-account-dialog";
import CreatePasswordDialog from "./create-password-dialog";

interface CreateAccountFlowProps {
  onClose: () => void;
}

export interface BaseUserData {
  name: string;
  dob: Date;
}

export type UserData =
  | (BaseUserData & { phone: string; email?: never })
  | (BaseUserData & { email: string; phone?: never });

export type ServerUserData = UserData & {
  password: string;
  username: string;
};

const CreateAccountFlow: React.FC<CreateAccountFlowProps> = ({ onClose }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>();
  const router = useRouter();

  const handleCreateNext = (data: UserData) => {
    setUserData(data);
    setIsCreateOpen(false);
    setIsPasswordOpen(true);
  };

  const handleSignupComplete = () => {
    setIsPasswordOpen(false);
    // here it needs to send the data to the server niggus
    onClose();
    router.push("/dashboard");
  };

  return (
    <>
      <CreateAccountDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onNext={handleCreateNext}
        onClose={onClose}
      />
      {userData && (
        <CreatePasswordDialog
          open={isPasswordOpen}
          onOpenChange={setIsPasswordOpen}
          userData={userData}
          onComplete={handleSignupComplete}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default CreateAccountFlow;
