import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";

type SidebarMenuType = {
  title: string;
  icon: IconType;
  link: string;
};

interface SidebarType {
  menu: SidebarMenuType[];
}

export default function Sidebar({ menu }: SidebarType) {
  const location = useLocation();

  return (
    <div className="min-w-60 fixed top-4 bottom-4 bg-white border border-gray-200 shadow-lg rounded px-2 flex flex-col justify-between z-30">
        <div>
          {/* LOGO */}
          <div className="text-center mb-5 flex justify-center border-b border-gray-200 px-2 h-14 items-center">
            <img 
              src="/Logo.svg" 
              alt="Logo" 
              className="h-8 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <h2 
              className="font-bold italic underline text-gray-800 hidden"
              style={{ display: 'none' }}
            >
              Logo
            </h2>
          </div>

        {/* MENU */}
        {menu.map((item, i) => (
          <Link
            key={i}
            to={item.link}
            className={`flex items-center gap-2 hover:bg-gray-100 mb-1 p-2 rounded transition-colors ${
              location.pathname === item.link && "bg-blue-50 border-l-4 border-blue-500 text-blue-600"
            }`}
          >
            <item.icon className="text-xl" /> 
            <span className="capitalize font-medium">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}