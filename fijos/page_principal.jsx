"use client";

import StrategyMap from "@/components/StrategyMap";

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard General</h1>

      {/* 🔹 Aquí mostramos el StrategyMap */}
      <StrategyMap />

      <p className="text-gray-600 mt-6">
        Usa la barra superior para navegar entre módulos.
      </p>
    </main>
  );
}
