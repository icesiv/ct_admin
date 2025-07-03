import type { Metadata } from "next";
import DashboardClient from '@/components/dashboard/DashboardClient';

export const metadata: Metadata = {
  title: "Dashboard | CT Admin",
  description: "Home for Admin Dashboard",
};

export default function Dashboard() {
  return <DashboardClient />;
}