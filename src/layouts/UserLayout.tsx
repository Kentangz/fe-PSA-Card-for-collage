import React, { type PropsWithChildren } from "react";
import Sidebar from "@/components/SideBar";

import type { IconType } from "react-icons";

type MenuItem = {
  title: string;
  link: string;
  icon: IconType;
  subMenu?: { title: string; link: string }[];
};

type UserLayoutProps = PropsWithChildren<{
  menu: MenuItem[];
  navbarRight?: React.ReactNode;
  title?: string;
  isLoading?: boolean;
}>;

const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  menu,
  navbarRight,
  title = "Dashboard Overview",
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" aria-busy>
        <Sidebar menu={menu} />
        <nav className="w-full lg:pl-64 pl-4 mt-4">
          <div className="h-14 flex justify-between items-center px-2">
            <div className="flex items-center">
              <div className="w-10 lg:w-0"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </nav>
        <div className="lg:pl-64 pl-4 pr-4 pb-4">
          <div className="mt-4 space-y-6">
            <div className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar menu={menu} />
      <nav className="w-full lg:pl-64 pl-4 mt-4">
        <div className="h-14 flex justify-between items-center px-2">
          <div className="flex items-center">
            <div className="w-10 lg:w-0"></div>
            <h1 className="text-lg lg:text-xl font-medium text-gray-800 truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {navbarRight}
          </div>
        </div>
      </nav>
      <main className="lg:pl-64 pl-4 pr-4 pb-4">
        <div className="mt-4 space-y-6 sm:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;

