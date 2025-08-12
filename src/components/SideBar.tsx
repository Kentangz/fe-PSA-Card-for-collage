import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { useState, useEffect, useRef } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      
      if (!isMobile || !isOpen) return;

      if (
        sidebarRef.current?.contains(target) ||
        menuButtonRef.current?.contains(target)
      ) {
        return;
      }
      

      setIsOpen(false);
    };

    const handleTouchOutside = (event: TouchEvent) => {
      const target = event.target as Node;
      
      if (!isMobile || !isOpen) return;
      
      if (
        sidebarRef.current?.contains(target) ||
        menuButtonRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleTouchOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [isMobile, isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && isOpen) {
        setIsOpen(false);
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      {!isOpen && (
        <button
          ref={menuButtonRef}
          id="menu-button"
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:bg-gray-50 transition-colors touch-manipulation"
          onClick={() => setIsOpen(true)}
        >
          <HiMenuAlt3 className="text-xl text-gray-700" />
        </button>
      )}

      {/* Mobile Backdrop/Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="sidebar"
        className={`
          fixed top-4 bottom-4 bg-white border border-gray-200 shadow-lg rounded px-2 flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? `w-72 max-w-[80vw] left-4 transform ${isOpen ? 'translate-x-0 z-50' : '-translate-x-full z-30'}`
            : 'min-w-60 w-60 left-4 z-30'
          }
          lg:translate-x-0 lg:left-4 lg:right-auto lg:w-60 lg:min-w-60
        `}
      >
        <div>
          {/* LOGO */}
          <div className="text-center mb-5 flex justify-between items-center border-b border-gray-200 px-2 h-14">
            <div className="flex justify-center flex-1">
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
            
            {isMobile && isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors touch-manipulation"
              >
                <HiX className="text-xl text-gray-700" />
              </button>
            )}
          </div>

          {/* MENU */}
          {menu.map((item, i) => (
            <Link
              key={i}
              to={item.link}
              onClick={() => isMobile && setIsOpen(false)} // Close mobile menu on navigation
              className={`flex items-center gap-2 hover:bg-gray-100 mb-1 p-2 rounded transition-colors touch-manipulation ${
                location.pathname === item.link && "bg-blue-50 border-l-4 border-blue-500 text-blue-600"
              }`}
            >
              <item.icon className="text-xl flex-shrink-0" /> 
              <span className="capitalize font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}