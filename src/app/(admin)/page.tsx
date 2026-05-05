import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FilePlus, Library, Star, Zap } from "lucide-react";

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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:flex md:flex-row gap-3 md:gap-4 w-full max-w-sm md:max-w-none justify-center mx-auto">
        <Link
          href="/posts/create"
          className="flex items-center justify-center space-x-2 px-3 py-3 md:px-5 md:py-2.5 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <FilePlus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="whitespace-nowrap">New Post</span>
        </Link>
        <Link
          href="/posts"
          className="flex items-center justify-center space-x-2 px-3 py-3 md:px-5 md:py-2.5 text-sm md:text-base font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
        >
          <Library className="w-4 h-4 md:w-5 md:h-5" />
          <span className="whitespace-nowrap">All Posts</span>
        </Link>
        <Link
          href="/posts"
          className="flex items-center justify-center space-x-2 px-3 py-3 md:px-5 md:py-2.5 text-sm md:text-base font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors shadow-sm"
        >
          <Star className="w-4 h-4 md:w-5 md:h-5" />
          <span className="whitespace-nowrap">Lead News</span>
        </Link>
        <Link
          href="/posts"
          className="flex items-center justify-center space-x-2 px-3 py-3 md:px-5 md:py-2.5 text-sm md:text-base font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors shadow-sm"
        >
          <Zap className="w-4 h-4 md:w-5 md:h-5" />
          <span className="whitespace-nowrap">Breaking News</span>
        </Link>
      </div>
    </div>
  );
}