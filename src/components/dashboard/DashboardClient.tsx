"use client";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import React from "react";

import { NewsMetrics } from "@/components/dashboard/NewsMetrics";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import ViewCountChart from "@/components/dashboard/ViewCountChart";
import TopTags from "@/components/dashboard/TopTags";

export default function DashboardClient() {
  const { user, loading, isAuthenticated, router } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <QuickAccess />
        <NewsMetrics />

        <ViewCountChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <TopTags />
      </div>
    </div>
  );
}
