import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto w-full max-w-60 mb-6 rounded-2xl text-xs text-brand-300 bg-gray-100 p-2 text-center dark:bg-white/[0.03]`}
    >
      <span>v {process.env.NEXT_PUBLIC_APP_VERSION}</span>
    </div>
  );
}
