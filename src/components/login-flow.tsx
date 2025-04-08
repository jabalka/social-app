"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LoginAccountDialog from "./login-account-dialog";

interface CreateAccountFlowProps {
  onClose: () => void;
}

export type BaseLoginUserData =
  | { username: string; email?: never }
  | { username?: never; email: string };

  export type LoginUserData = BaseLoginUserData & {
    password: string;
    // phone?: never; // Explicitly forbid phone
  };

export interface ServerUserData {
  password: string;
  email: string;
}

const LoginFlow: React.FC<CreateAccountFlowProps> = ({ onClose }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [userData, setUserData] = useState<BaseLoginUserData>();
  const router = useRouter();

  const handleCreateNext = (data: BaseLoginUserData) => {
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
      <LoginAccountDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onNext={handleCreateNext}
        onClose={onClose}
      />
      {/* {userData && (
        <CreatePasswordDialog
          open={isPasswordOpen}
          onOpenChange={setIsPasswordOpen}
          userData={userData}
          onComplete={handleSignupComplete}
          onClose={onClose}
        />
      )} */}
    </>
  );
};

export default LoginFlow;
