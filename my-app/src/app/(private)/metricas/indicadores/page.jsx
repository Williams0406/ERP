"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react"; // Añadimos iconos para contexto
import IndicadoresTree from "@/components/indicadores/IndicadoresTree";
import IndicadorFormModal from "@/components/indicadores/IndicadorFormModal";
import RelacionCreatorModal from "@/components/indicadores/RelacionCreatorModal";
import CategoriaAssignModal from "@/components/indicadores/CategoriaAssignModal";

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
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in"> 
      {/* Header con jerarquía clara según Guía de Diseño */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#E5E9EC] gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#1A202C] tracking-tight">
            Gestión de Indicadores
          </h1>
          <div className="flex items-center gap-2 mt-1 text-[#4A5568]">
            <Info className="h-4 w-4 text-[#A5AFB8]" />
            <p className="text-sm">
              Define la jerarquía y métodos de agregación (Promedio/Suma) para el BSC.
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleNew}
          className="btn-primary flex items-center gap-2 h-11 px-6 shadow-card hover:shadow-card-hover"
        >
          <Plus className="h-4 w-4" />
          Crear Nuevo Indicador
        </Button>
      </div>

      {/* Contenedor del Árbol con estilo de tarjeta para elevar el contenido */}
      <div className="card p-4 min-h-[600px]">
        <IndicadoresTree
          onEdit={handleEdit}
          onRel={handleRelacion}
          onCategoria={handleCategoria}
        />
      </div>

      {/* Modales - Se asume que estos componentes respetan el radio de 12px de la guía */}
      <IndicadorFormModal open={openForm} setOpen={setOpenForm} indicador={selectedIndicador} />
      <RelacionCreatorModal open={openRelacion} setOpen={setOpenRelacion} indicador={selectedIndicador} />
      <CategoriaAssignModal open={openCategoria} setOpen={setOpenCategoria} indicador={selectedIndicador} />
    </div>
  );
}