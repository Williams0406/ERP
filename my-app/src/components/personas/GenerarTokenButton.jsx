import api, { createCodigoRegistro } from "@/lib/api";
import { useState } from "react";

export default function GenerarTokenButton({ personaId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    // ... (validación de login igual)
    setLoading(true);
    try {
      // ELIMINAR el bloque: const res = await api.get(...) que lanzaba el alert
      
      // Llamar directamente a la creación
      await createCodigoRegistro(personaId);

      if (onSuccess) onSuccess(); // Esto refrescará la tabla
    } catch (err) {
      // ... (manejo de errores igual)
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Generando..." : "Generar token"}
    </button>
  );
}
