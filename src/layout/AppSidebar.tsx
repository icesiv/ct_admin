"use client";
import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

type UserRole = 'admin' | 'editor' | 'basic';

import {
  LayoutDashboard,
  Newspaper,
  Star,
  ShieldAlert,
  Images,
  MapPin,
  FileVideo2,
  Hash,
  Sparkles,
  Megaphone,
  LayoutList,
  Users,
  Logs,
  ChartBarStacked,
  CircleUserRound,
  ChevronDown,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; new?: boolean }[];
  // roles removed
};

export const allNavItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard />,
    path: "/dashboard",
  },
  {
    name: "Posts",
    icon: <Newspaper />,
    subItems: [
      { name: "Create Post", path: "/posts/create" },
      { name: "Manage Posts", path: "/posts" },
    ],
  },
  {
    name: "Lead News",
    icon: <Star />,
    path: "/lead-news",
  },
  {
    name: "Breaking News",
    icon: <ShieldAlert />,
    path: "/breaking-news",
  },
  {
    name: "Photo Galleries",
    icon: <Images />,
    path: "#",
    subItems: [
      { name: "Create Gallery", path: "/gallery/create" },
      { name: "Manage Galleries", path: "/gallery/manage" },
    ]
  },
  {
    name: "News by Location",
    icon: <MapPin />,
    path: "#",
    subItems: [
      { name: "By Division", path: "/location-news/division" },
      { name: "By District", path: "/location-news/district" },
    ]
  },
  {
    name: "Videos",
    icon: <FileVideo2 />,
    path: "/video",
  },
  {
    name: "Manage Topics",
    icon: <Hash />,
    path: "#",
    subItems: [
      { name: "All Topics", path: "/topics" },
      { name: "New Topics", path: "/topics/new" },
      { name: "Bulk Assign", path: "/topics/assign" },
      { name: "Tranding", path: "/topics/tranding" }
    ]
  },
  {
    name: "Spacial",
    icon: <Sparkles />,
    path: "/spacial",
  },
  {
    name: "Advertisement",
    icon: <Megaphone />,
    path: "/ads",
  },
  {
    name: "Poll",
    icon: <LayoutList />,
    path: "/polls",
  },
  {
    name: "Users",
    icon: <Users />,
    subItems: [
      { name: "New User", path: "/users/create" },
      { name: "Manage Users", path: "/users" },
    ],
  },
  {
    name: "Menus",
    icon: <Logs />,
    path: "/menu",
  },
  {
    name: "Categories",
    icon: <ChartBarStacked />,
    path: "/categories",
  },
  {
    name: "Author Profiles",
    icon: <CircleUserRound />,
    path: "#",
    subItems: [
      { name: "New Author", path: "/authors/create" },
      { name: "Manage Author", path: "/authors" },
    ]
  },
];

interface AppSidebarProps {
  isSuperAdmin?: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openSubmenu, setOpenSubmenu] = useState<{
    index: number;
  } | null>(null);

  const filterMenuItems = (items: NavItem[]): NavItem[] => {
    if (!user) return [];

    const isAdmin = user.is_super_admin;
    const assignedMenus = user.assigned_menus || [];

    return items
      .filter((item) => isAdmin || assignedMenus.includes(item.name))
      .map((item) => {
        // Main items with subItems handle subitem logic implicitly or explicitly.
        // For simplicity, if parent is assigned, subitems are available.
        return item;
      });
  };

  const filteredNavItems = filterMenuItems(allNavItems);

  const isActive = useCallback((path: string | undefined) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => {
      const newState =
        prev?.index === index
          ? null
          : { index };
      return newState;
    });
  };


  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer w-full py-2 ${!isExpanded && !isHovered ? "lg:justify-center px-2" : "lg:justify-start px-3"}`}
            >
              <span
                className={`${openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text text-sm font-medium">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"} py-2 ${!isExpanded && !isHovered ? "lg:justify-center px-2" : "lg:justify-start px-3"}`}
              >
                <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text text-sm font-medium">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.index === index ? "auto" : "0px",
              }}
            >
              <ul className="mt-1 space-y-0.5 ml-9 border-l-2 border-gray-200 dark:border-gray-700">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`block w-full py-1.5 pl-4 pr-3 text-sm rounded-r-md transition-colors ${isActive(subItem.path)
                        ? "text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{subItem.name}</span>
                        {subItem.new && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white bg-red-500 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col justify-between lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 transition-all duration-300 ease-in-out z-50 border-r border-gray-200 h-screen
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col min-h-0 flex-1">
        <div className={`py-4 flex flex-shrink-0 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start px-2"}`}>
          <Link href="/">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <Image className="dark:hidden" src="/images/logo/logo-wide.svg" alt="Logo" width={180} height={32} />
                <Image className="hidden dark:block" src="/images/logo/logo-wide.svg" alt="Logo" width={180} height={32} />
              </>
            ) : (
              <Image src="/images/logo/logo-box.svg" alt="Logo" width={32} height={32} />
            )}
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <nav className="pb-4 mt-2">
            <div className="flex flex-col gap-2">
              {renderMenuItems(filteredNavItems)}
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;

