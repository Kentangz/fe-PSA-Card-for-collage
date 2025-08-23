import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { useState, useEffect, useRef } from "react";
import { HiMenuAlt3, HiX, HiChevronDown, HiChevronRight } from "react-icons/hi";

type SidebarSubMenuType = {
  title: string;
  link: string;
};

type SidebarMenuType = {
  title: string;
  icon: IconType;
  link: string;
  subMenu?: SidebarSubMenuType[];
};

interface SidebarType {
  menu: SidebarMenuType[];
}

export default function Sidebar({ menu }: SidebarType) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
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

  // Auto-expand menu if current path is a submenu item
  useEffect(() => {
    const currentPath = location.pathname;
    menu.forEach((item, index) => {
      if (item.subMenu) {
        const hasActiveSubMenu = item.subMenu.some(subItem => 
          currentPath === subItem.link || currentPath.startsWith(subItem.link)
        );
        if (hasActiveSubMenu) {
          setExpandedMenus(prev => new Set([...prev, index]));
        }
      }
    });
  }, [location.pathname, menu]);

  const toggleMenu = (index: number) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isActiveMenu = (item: SidebarMenuType) => {
    if (location.pathname === item.link) return true;
    if (item.subMenu) {
      return item.subMenu.some(subItem => 
        location.pathname === subItem.link || location.pathname.startsWith(subItem.link)
      );
    }
    return false;
  };

  const isActiveSubMenu = (subItem: SidebarSubMenuType) => {
    return location.pathname === subItem.link || location.pathname.startsWith(subItem.link);
  };

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
            <div key={i} className="mb-1">
              {/* Main Menu Item */}
              {item.subMenu ? (
                // Menu with submenu - clickable to toggle
                <button
                  onClick={() => toggleMenu(i)}
                  className={`w-full flex items-center justify-between gap-2 hover:bg-gray-100 p-2 rounded transition-colors touch-manipulation ${
                    isActiveMenu(item) && "bg-blue-50 border-l-4 border-blue-500 text-blue-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="text-xl flex-shrink-0" /> 
                    <span className="capitalize font-medium">{item.title}</span>
                  </div>
                  {expandedMenus.has(i) ? (
                    <HiChevronDown className="text-lg flex-shrink-0" />
                  ) : (
                    <HiChevronRight className="text-lg flex-shrink-0" />
                  )}
                </button>
              ) : (
                // Regular menu item - link
                <Link
                  to={item.link}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={`flex items-center gap-2 hover:bg-gray-100 p-2 rounded transition-colors touch-manipulation ${
                    location.pathname === item.link && "bg-blue-50 border-l-4 border-blue-500 text-blue-600"
                  }`}
                >
                  <item.icon className="text-xl flex-shrink-0" /> 
                  <span className="capitalize font-medium">{item.title}</span>
                </Link>
              )}

              {/* Submenu Items */}
              {item.subMenu && expandedMenus.has(i) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subMenu.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.link}
                      onClick={() => isMobile && setIsOpen(false)}
                      className={`flex items-center gap-2 hover:bg-gray-100 p-2 rounded transition-colors touch-manipulation text-sm ${
                        isActiveSubMenu(subItem) && "bg-blue-50 border-l-4 border-blue-500 text-blue-600 font-medium"
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></div>
                      <span className="capitalize">{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}