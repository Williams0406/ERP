"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function LogoutButton({ isCollapsed }) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <button
      id="logout-btn"
      onClick={handleLogout}
      title="Salir del sistema"
      className={`group flex items-center justify-center gap-3 w-full transition-all duration-150
        ${isCollapsed 
          ? "p-2 rounded-lg bg-[#FFE5E5] text-[#DD4A48] hover:bg-[#DD4A48] hover:text-white" 
          : "px-4 py-[10px] rounded-lg border border-[#E5E9EC] bg-white text-[#4A5568] hover:border-[#DD4A48] hover:text-[#DD4A48] hover:bg-[#FFE5E5]"
        }
      `}
    >
      <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
      {!isCollapsed && (
        <span className="text-[14px] font-medium">Cerrar Sesión</span>
      )}
    </button>
  );
}