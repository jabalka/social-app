"use client";

import { SessionProvider } from "next-auth/react";
import React, { PropsWithChildren } from "react";

const AuthProviders: React.FC<PropsWithChildren> =({ children }) => {

  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProviders;
