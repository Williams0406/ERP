"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ControlNavbar() {
  const pathname = usePathname();

  const items = [
    {
      label: "BSC",
      href: "/metricas/bsc",
    },
    {
      label: "Perspectivas",
      href: "/metricas/categorias",
    },
    {
      label: "Indicadores",
      href: "/metricas/indicadores",
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6">
      <div className="flex space-x-6 h-14 items-center">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative text-sm font-medium transition
                ${active ? "text-[#0D3B66]" : "text-gray-500 hover:text-gray-800"}
              `}
            >
              {item.label}

              {active && (
                <span className="absolute left-0 -bottom-[14px] w-full h-[2px] bg-[#0D3B66] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
