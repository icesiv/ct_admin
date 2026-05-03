import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper, Users, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome | CT Admin",
  description: "Home for Admin Dashboard",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 animate-in fade-in duration-700">
      {/* Logo */}
      <div className="relative w-full max-w-[280px] h-[60px] md:max-w-[340px] md:h-[80px] mb-8">
        <Image
          src="/images/logo/logo-wide.svg"
          alt="CT Admin Logo"
          fill
          className="object-contain drop-shadow-sm"
          priority
          quality={100}
        />
      </div>

      {/* Welcome Message */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome to <span className="text-brand-500">Dashboard</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Manage your content, users, and platform settings from this centralized dashboard..
        </p>
      </div>
    </div>
  );
}