"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import IndicadoresTree from "./components/IndicadoresTree";
import IndicadorFormModal from "./components/IndicadorFormModal";
import RelacionCreatorModal from "./components/RelacionCreatorModal";
import CategoriaAssignModal from "./components/CategoriaAssignModal";

export default function IndicadoresPage() {
  const [openForm, setOpenForm] = useState(false);
  const [openRelacion, setOpenRelacion] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);

  const [selectedIndicador, setSelectedIndicador] = useState(null);

  const handleNew = useCallback(() => {
    setSelectedIndicador(null);
    setOpenForm(true);
  }, []);

  const handleEdit = useCallback((i) => {
    setSelectedIndicador(i);
    setOpenForm(true);
  }, []);

  const handleRelacion = useCallback((i) => {
    setSelectedIndicador(i);
    setOpenRelacion(true);
  }, []);

  const handleCategoria = useCallback((i) => {
    setSelectedIndicador(i);
    setOpenCategoria(true);
  }, []);

  return (
    // Espaciado consistente y profesional
    <div className="p-8 space-y-8"> 
      <div className="flex justify-between items-center pb-4 border-b border-gray-200"> {/* Separador sutil */}
        <div>
          {/* Título: Color primario (#0D3B66) y tamaño 24px (en el rango de Títulos) */}
          <h1 className="text-3xl font-extrabold text-[#0D3B66]">Gestión de Indicadores</h1>
          {/* Subtítulo: Más claro y descriptivo */}
          <p className="text-base text-gray-500 mt-1.5">
            Arquitectura y jerarquía de indicadores clave para el Balanced Scorecard (BSC).
          </p>
        </div>
        <Button 
          onClick={handleNew}
          // Botón principal (Primario #0D3B66) con sombra sutil y radio-base de 8px (implícito en la clase `rounded-lg`)
          className="bg-[#0D3B66] hover:bg-[#0D3B66]/90 text-white shadow-lg transition-all"
        >
          + Crear Nuevo Indicador
        </Button>
      </div>

      <IndicadoresTree
        onEdit={handleEdit}
        onRel={handleRelacion}
        onCategoria={handleCategoria}
      />

      <IndicadorFormModal
        open={openForm}
        setOpen={setOpenForm}
        indicador={selectedIndicador}
      />

      <RelacionCreatorModal
        open={openRelacion}
        setOpen={setOpenRelacion}
        indicador={selectedIndicador}
      />

      <CategoriaAssignModal
        open={openCategoria}
        setOpen={setOpenCategoria}
        indicador={selectedIndicador}
      />
    </div>
  );
}