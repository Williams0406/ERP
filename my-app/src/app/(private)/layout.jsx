"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { onUnauthorized } from "@/lib/api";

export default function PrivateLayout({ children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
    }

    const handleUnauthorized = () => {
      router.replace("/");
    };
    onUnauthorized(handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`
          ${collapsed ? "ml-20" : "ml-64"}
          flex-1
          h-screen
          overflow-y-auto
          bg-gray-100
          p-6
          transition-all duration-150
        `}
      >
        {children}
      </main>
    </div>
  );
}
