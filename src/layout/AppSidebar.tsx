"use client";
import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext"; // Adjust path if needed

import {
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
  Megaphone,
  MapPin,
  LayoutList,
  Vote,
} from 'lucide-react';

type UserRole = 'admin' | 'editor' | 'basic';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; new?: boolean; roles?: UserRole[] }[];
  roles?: UserRole[]; // Array of roles allowed for this item
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard />,
    path: "/",
    roles: ['admin', 'editor', 'basic'],
  },
  {
    name: "Posts",
    icon: <Newspaper />,
    roles: ['admin', 'editor', 'basic'],
    subItems: [
      { name: "Create Post", path: "/posts/create", roles: ['admin', 'editor'] },
      { name: "Manage Posts", path: "/posts", roles: ['admin', 'editor', 'basic'] },
    ],
  },
  {
    name: "Lead News",
    icon: <Star />,
    path: "/lead-news",
    roles: ['admin', 'editor'],
  },
  {
    name: "Breaking News",
    icon: <ShieldAlert />,
    path: "/breaking-news",
    roles: ['admin', 'editor'],
  },
  {
    name: "Photo Galleries",
    icon: <Images />,
    path: "#",
    roles: ['admin', 'editor'],
    subItems: [
      { name: "Create Gallery", path: "/gallery/create" },
      { name: "Manage Galleries", path: "/gallery/manage" },
    ]
  },
  {
    name: "News by Location",
    icon: <MapPin />,
    path: "#",
    roles: ['admin', 'editor'],
    subItems: [
      { name: "By Division", path: "/location-news/division" },
      { name: "By District", path: "/location-news/district" },
    ]
  },
  {
    name: "Videos",
    icon: <FileVideo2 />,
    roles: ['admin'],
    path: "/video",
  },
  {
    name: "Manage Topics",
    icon: <Hash />,
    path: "#",
    roles: ['admin', 'editor'],
    subItems: [
      { name: "All Topics", path: "/topics" },
      { name: "New Topics", path: "/topics/new" },
      { name: "Bulk Assign", path: "/topics/assign" },
      { name: "Tranding", path: "/topics/tranding" }
    ]
  },
  {
    name: "Election Results",
    icon: <Vote />,
    path: "/election",
    roles: ['admin', 'editor'],
  },
];

const othersItems: NavItem[] = [

  {
    name: "Advertisement",
    icon: <Megaphone />,
    path: "/ads",
    roles: ['admin'],
  },
  {
    name: "Poll",
    icon: <LayoutList />,
    path: "/polls",
    roles: ['admin'],
  },
  {
    name: "Users",
    icon: <Users />,
    roles: ['admin'],
    subItems: [
      { name: "New User", path: "/users/create" }, // Inherits parent role if not specified
      { name: "Manage Users", path: "/users" },
    ],
  },
  {
    name: "Menus",
    icon: <Logs />,
    path: "/menu",
    roles: ['admin'],
  },
  {
    name: "Categories",
    icon: <ChartBarStacked />,
    path: "/categories",
    roles: ['admin'],
  },
  {
    name: "Author Profiles",
    icon: <CircleUserRound />,
    path: "#",
    roles: ['admin'],
    subItems: [
      { name: "New Author", path: "/authors/create" },
      { name: "Manage Author", path: "/authors" },
    ]
  },
];

interface AppSidebarProps {
  userRole: UserRole;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userRole }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  // --- FIXED FILTERING LOGIC ---
  const filterMenuItemsByRole = (items: NavItem[], role: UserRole): NavItem[] => {
    return items
      .filter((item) => item.roles?.includes(role)) // Filter main items based on roles
      .map((item) => {
        // Filter subItems based on their roles or inherit from parent
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter(
            (subItem) =>
              subItem.roles?.includes(role) || // Check subItem's own roles
              (!subItem.roles && item.roles?.includes(role)) // Or inherit if subItem has no roles
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      });
  };
  // --- END FIXED FILTERING LOGIC ---

  const filteredNavItems = filterMenuItemsByRole(navItems, userRole);
  const filteredOthersItems = filterMenuItemsByRole(othersItems, userRole);

  const isActive = useCallback((path: string | undefined) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      const newState =
        prev?.type === menuType && prev?.index === index
          ? null
          : { type: menuType, index };
      return newState;
    });
  };

  // --- COLLAPSIBLE SECTION COMPONENT ---
  const CollapsibleSection = ({
    title,
    children,
    isOpen,
    onToggle,
    hasItems
  }: {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    hasItems: boolean;
  }) => {
    if (!hasItems) return null;

    return (
      <div className="mb-2">
        {(isExpanded || isHovered || isMobileOpen) ? (
          <button
            onClick={onToggle}
            className="w-full flex items-center bg-gray-100 dark:bg-gray-800 justify-between px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group mb-1"
          >
            <span>{title}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                } opacity-0 group-hover:opacity-100`}
            />
          </button>
        ) : (
          <div className="flex justify-center py-2 mb-1">
            <Ellipsis className="w-4 h-4 text-gray-400" />
          </div>
        )}

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen || (!isExpanded && !isHovered && !isMobileOpen) ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          {children}
        </div>
      </div>
    );
  };

  // State for collapsible sections
  const [sectionsState, setSectionsState] = useState(() => {
    const isOthersActive = othersItems.some(item =>
      (item.path === pathname) ||
      (item.subItems?.some(sub => sub.path === pathname))
    );
    return {
      main: !isOthersActive,
      others: isOthersActive
    };
  });

  const toggleSection = (section: 'main' | 'others') => {
    setSectionsState(prev => ({
      main: section === 'main' ? !prev.main : false,
      others: section === 'others' ? !prev.others : false
    }));
  };


  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer py-2 ${!isExpanded && !isHovered ? "lg:justify-center px-2" : "lg:justify-start px-3"}`}
            >
              <span
                className={`${openSubmenu?.type === menuType && openSubmenu?.index === index
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
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
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
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index ? "auto" : "0px",
              }}
            >
              <ul className="mt-1 space-y-0.5 ml-9 border-l-2 border-gray-200 dark:border-gray-700">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`block py-1.5 pl-4 pr-3 text-sm rounded-r-md transition-colors ${isActive(subItem.path)
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

              <CollapsibleSection
                title="Main Menu"
                isOpen={sectionsState.main}
                onToggle={() => toggleSection('main')}
                hasItems={filteredNavItems.length > 0}
              >
                {renderMenuItems(filteredNavItems, "main")}
              </CollapsibleSection>

              <CollapsibleSection
                title="Admin Menu"
                isOpen={sectionsState.others}
                onToggle={() => toggleSection('others')}
                hasItems={filteredOthersItems.length > 0}
              >
                {renderMenuItems(filteredOthersItems, "others")}
              </CollapsibleSection>

            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
