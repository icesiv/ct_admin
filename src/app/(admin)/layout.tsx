"use client";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext"; // Make sure this path is correct
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { usePathname } from "next/navigation";
import { allNavItems } from "@/layout/AppSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type UserRole = 'admin' | 'editor' | 'basic';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const { user, loading } = useAuth();
  const pathname = usePathname();

  let isSuperAdmin: boolean = false; // Default value

  if (user?.is_super_admin) {
    isSuperAdmin = user.is_super_admin;
  }

  // Route protection based on assigned menus
  if (!loading && user) {
    const isAdmin = user.is_super_admin;
    if (!isAdmin && pathname !== '/') { // Always allow dashboard '/'
      const assignedMenus = Array.isArray(user.assigned_menus) ? user.assigned_menus : [];
      let isAllowed = false;

      for (const item of allNavItems) {
        if (assignedMenus.includes(item.name)) {
          // Check parent path
          if (item.path && item.path !== '/' && item.path !== '#' && pathname.startsWith(item.path)) {
            isAllowed = true;
            break;
          }
          // Check sub items
          if (item.subItems) {
            for (const sub of item.subItems) {
              if (pathname.startsWith(sub.path)) {
                isAllowed = true;
                break;
              }
            }
          }
        }
        if (isAllowed) break;
      }

      if (!isAllowed) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You do not have permission to view this page. This content is restricted.
              </p>
              <a href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Return to Dashboard
              </a>
            </div>
          </div>
        );
      }
    }
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar isSuperAdmin={isSuperAdmin} />

      {/* <AppSidebar userRole="basic" />  */}
      {/* <AppSidebar userRole="editor" />  */}
      {/* <AppSidebar userRole="admin" />  */}


      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />

        <div className="p-4 mx-auto max-w-7xl md:p-6">
          {children}
        </div>

      </div>
    </div>
  );
}