"use client";

import { useEffect, useState } from "react";
import { getPersonas } from "@/lib/api";
import UsuariosTable from "@/components/usuarios/UsuariosTable";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const load = async () => {
      const personas = await getPersonas();
      setUsuarios(personas.filter((p) => p.tiene_usuario));
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}
