"use client";

import { Button } from "@/components/ui/button";

export default function EmptyState({ onCreate }) {
  return (
    <div className="text-center py-20 border rounded">
      <p className="text-gray-500 mb-4">No hay Balanced ScoreCards registrados.</p>
      <Button onClick={onCreate}>Crear BSC</Button>
    </div>
  );
}
