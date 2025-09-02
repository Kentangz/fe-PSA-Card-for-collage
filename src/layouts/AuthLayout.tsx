import React, { type PropsWithChildren } from "react";
import LeftPanel from "@/components/LeftPanel";

type AuthLayoutProps = PropsWithChildren;

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white">
      <LeftPanel />
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 lg:px-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

