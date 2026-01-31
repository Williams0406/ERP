"use client";

import { useEffect, useState } from "react";
import { getPersonas } from "@/lib/api";
import PersonasTable from "@/components/personas/PersonasTable";
import PersonaModal from "@/components/personas/PersonaModal";

export default function PersonasPage() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPersonas = async () => {
    setLoading(true);
    const data = await getPersonas();
    setPersonas(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPersonas();
  }, []);

  const handleCreated = (newPersona) => {
    setPersonas((prev) => [newPersona, ...prev]);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Personas</h1>
        <PersonaModal onCreated={handleCreated} />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <PersonasTable personas={personas} onRefresh={loadPersonas} />
      )}
    </div>
  );
}
