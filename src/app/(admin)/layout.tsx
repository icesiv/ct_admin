"use client";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext"; // Make sure this path is correct
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type UserRole = 'admin' | 'editor' | 'basic';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const { user, loading } = useAuth();

  let userRole: UserRole = 'basic'; // Default value

  if (user?.user_role) {
    if (['admin', 'editor', 'basic'].includes(user.user_role)) {
      userRole = user.user_role as UserRole; // Assert after validation
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
      <AppSidebar userRole={userRole} />

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