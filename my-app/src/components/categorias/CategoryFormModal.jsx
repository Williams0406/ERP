"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * CategoryFormModal refactorizado bajo estándares NATALY
 * Enterprise Minimal + Data Density Optimized
 */
export default function CategoryFormModal({ open, onClose, onSubmit, initialData }) {
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nombre.trim()) return;

    setLoading(true);
    await onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Contenedor del modal: 
        Ancho estándar 720px (o max-w-lg para este caso simple), 
        Radio 12px, Fondo blanco sólido y sombra elevada.
      */}
      <DialogContent 
        className="max-w-lg p-0 bg-white border border-[#E5E9EC] rounded-xl shadow-elevated overflow-hidden"
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-[#1A202C]">
            {initialData ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
        </DialogHeader>

        {/* Body del modal: 
            Padding 24px, espacio entre campos 16px.
        */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#4A5568]">
              Nombre <span className="text-[#DD4A48]">*</span>
            </label>
            <input
              type="text"
              placeholder="Nombre de la categoría"
              className="input-base h-[44px]"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#4A5568]">
              Descripción
            </label>
            <textarea
              placeholder="Descripción de la categoría"
              className="input-base min-h-[100px] py-3 resize-none"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer del modal: 
            Fondo diferenciado, borde superior y botones alineados a la derecha.
        */}
        <DialogFooter className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E9EC] flex gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="btn-secondary h-[44px]"
          >
            Cancelar
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !nombre.trim()}
            className="btn-primary h-[44px]"
          >
            {loading ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}