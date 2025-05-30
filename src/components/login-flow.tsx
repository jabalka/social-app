"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LoginAccountDialog from "./login-account-dialog";
import LoginPasswordDialog from "./login-password-dialog";

interface LoginAccountFlowProps {
  onClose: () => void;
  onForgotPassword: () => void;
  onSignUpRequest: () => void;
}

export type BaseLoginUserData = { username: string; email?: never } | { username?: never; email: string };

export type LoginUserData = BaseLoginUserData & {
  password: string;
  // phone?: never; // Explicitly forbid phone
};

export interface ServerUserData {
  password: string;
  email: string;
}

const LoginFlow: React.FC<LoginAccountFlowProps> = ({ onClose, onForgotPassword, onSignUpRequest }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [userData, setUserData] = useState<BaseLoginUserData>();
  const router = useRouter();

  const handleLoginNext = (data: BaseLoginUserData) => {
    setUserData(data);
    setIsLoginOpen(false);
    setIsPasswordOpen(true);
  };

  const handleLoginComplete = async () => {
    setIsPasswordOpen(false);
    router.push("/dashboard");

    onClose();
  };

  return (
    <>
      <LoginAccountDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onNext={handleLoginNext}
        onClose={onClose}
        onSignUpRequest={onSignUpRequest}
      />
      {userData && (
        <LoginPasswordDialog
          open={isPasswordOpen}
          onOpenChange={setIsPasswordOpen}
          userData={userData}
          onComplete={handleLoginComplete}
          onClose={onClose}
          onForgotPassword={onForgotPassword}
        />
      )}
    </>
  );
};

export default LoginFlow;
