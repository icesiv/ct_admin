"use client";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

import React from "react";

// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";


// import type { Metadata } from "next";

// TODO : fix meta title
// export const metadata: Metadata = {
//   title:
//     "Dashboard | CT Admin",
//   description: "Home for Admin Dashboard",
// };


export default function Dashboard() {
  const { user, loading, isAuthenticated, handleLogout, router } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [loading, isAuthenticated, router]);

  const handleAllNews = () => {
    router.push('/news/list');
  };

  const handleAddNews = () => {
    router.push('/news/add');
  };

  const updateProfile = () => {
    router.push('/profile/update');
  };

  const navigateCategories = () => {
    router.push('/categories');
  };

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
      {/* <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}
    </div>
  );
}
