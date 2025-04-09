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
  email: string;
}

export interface UserData extends BaseUserData {
  username: string;
  password: string;
  // Ensure phone can't exist here
}



export interface ServerUserData extends BaseUserData {
  password: string;
  email: string;
}

const CreateAccountFlow: React.FC<CreateAccountFlowProps> = ({ onClose }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [userData, setUserData] = useState<BaseUserData>();
  const router = useRouter();

  const handleCreateNext = (data: BaseUserData) => {
    setUserData(data);
    setIsCreateOpen(false);
    setIsPasswordOpen(true);
  };

  const handleSignupComplete = async () => {
    setIsPasswordOpen(false);

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
