import { cn } from "@/utils/cn.utils";
import React from "react";

interface Props {

  className?: string;
}

const LogoutLoader: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 flex items-center justify-center bg-black text-white z-50", className)}
>
    <p>Logging you out...</p>
  </div>
    );
};

export default LogoutLoader;
