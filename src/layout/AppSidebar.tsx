"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";

import {
  Settings,
  Users,
  Logs,
  ChartBarStacked,
  Hash,
  Star,
  FileVideo2,
  ShieldAlert,
  Images,
  LayoutDashboard,
  Newspaper,
  CircleUserRound,
  ChevronDown,
  Ellipsis,
} from 'lucide-react';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard />,
    path: "/",
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
    subItems: [
      { name: "Create Gallery", path: "/coming-soon" },
      { name: "Manage Galleries", path: "/photo-gallery" },
    ],
  },
  {
    name: "Videos",
    icon: <FileVideo2 />,
    subItems: [
      { name: "Create Video", path: "/coming-soon" },
      { name: "Homepage Videos", path: "/video/home" },
    ],
  },
  {
    name: "Topics",
    icon: <Hash />,
    path: "/topics",
  }
];

const othersItems: NavItem[] = [
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
    path: "/menu"
  },
  {
    name: "Categories",
    icon: <ChartBarStacked />,
    path: "/categories"
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
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
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                      </span>
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

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col justify-between lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900  transition-all duration-300 ease-in-out z-50 border-r border-gray-200 h-screen
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Content Container */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Logo - Fixed at top */}
        <div
          className={`py-6 flex flex-shrink-0 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
        >
          <Link href="/">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <Image
                  className="dark:hidden"
                  src="/images/logo/logo-wide.svg"
                  alt="Logo"
                  width={260}
                  height={32}
                />
                <Image
                  className="hidden dark:block"
                  src="/images/logo/logo-wide.svg"
                  alt="Logo"
                  width={260}
                  height={32}
                />
              </>
            ) : (
              <Image
                src="/images/logo/logo-box.svg"
                alt="Logo"
                width={32}
                height={32}
              />
            )}
          </Link>
        </div>

        {/* Scrollable Menu Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <nav className="pb-4">
            <div className="flex flex-col gap-6">
              {/* Main Menu */}
              <div>
                <h2
                  className={`mb-4 text-xs font-semibold uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Main Menu"
                  ) : (
                    <Ellipsis className="w-4 h-4" />
                  )}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>

              {/* Admin Menu */}
              <div>
                <h2
                  className={`mb-4 text-xs font-semibold uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Admin Menu"
                  ) : (
                    <Ellipsis className="w-4 h-4" />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </div>

    </aside>
  );
};

export default AppSidebar;