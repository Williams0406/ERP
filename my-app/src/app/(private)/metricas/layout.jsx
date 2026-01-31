"use client";

import ControlNavbar from "@/components/metricas/Navbar";

export default function ControlLayout({ children }) {
  return (
    <div className="flex flex-col h-full">
      {/* Navbar de Control */}
      <ControlNavbar />

      {/* Contenido */}
      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>
    </div>
  );
}
