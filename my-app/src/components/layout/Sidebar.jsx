"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCog, Menu, ChevronLeft, PieChart } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  const menu = [
    { label: "Personas", href: "/personas", icon: Users },
    { label: "Usuarios", href: "/usuarios", icon: UserCog },
    { label: "Metricas", href: "/metricas", icon: PieChart },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40
        ${collapsed ? "w-20" : "w-64"}
        h-screen
        bg-[#F7F9FA]
        border-r border-[#E5E9EC]
        flex flex-col
        transition-all duration-150
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#E5E9EC]">
        {!collapsed && (
          <span className="text-[18px] font-semibold text-[#1A202C]">
            ERP <span className="text-[#0D3B66] font-normal">| TEST</span>
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-[#E5E9EC]"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menu.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-[10px] rounded-lg transition-all
                ${
                  active
                    ? "bg-[#0D3B661a] text-[#0D3B66] border-l-4 border-[#0D3B66]"
                    : "hover:bg-[#F5F8FA] text-[#4A5568]"
                }
              `}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5E9EC]">
        <LogoutButton isCollapsed={collapsed} />
      </div>
    </aside>
  );
}
