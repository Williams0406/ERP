"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategorias, updateBSC } from "@/lib/api";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Search,
  GripVertical,
  X,
  Layers,
  ArrowRight,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   COMPONENTES AUXILIARES (ESTILOS NATALY)
   ============================================================ */

function SortableItem({ cat, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border border-[#E5E9EC] rounded-lg shadow-sm group transition-micro ${isDragging ? 'shadow-elevated z-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-[#A5AFB8] hover:text-[#4A5568]">
        <GripVertical size={16} />
      </div>
      <span className="flex-1 text-sm font-medium text-[#1A202C]">{cat.nombre}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onRemove(cat.id)}
        className="h-8 w-8 text-[#A5AFB8] hover:text-[#DD4A48] hover:bg-red-50"
      >
        <X size={14} />
      </Button>
    </div>
  );
}

function CategoryCard({ cat, isAssigned, onAdd }) {
  return (
    <div className={`p-3 rounded-lg border flex items-center justify-between transition-micro ${isAssigned ? 'bg-[#E0FBF6] border-[#22A699]' : 'bg-white border-[#E5E9EC] hover:border-[#0D3B66]'}`}>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#1A202C]">{cat.nombre}</span>
        <span className="text-xs text-[#A5AFB8]">ID: {cat.id}</span>
      </div>
      <Button
        size="sm"
        disabled={isAssigned}
        onClick={() => onAdd(cat)}
        className={`h-8 px-3 ${isAssigned ? 'bg-[#22A699] text-white' : 'btn-primary'}`}
      >
        {isAssigned ? <CheckCircle2 size={14} /> : "Agregar"}
      </Button>
    </div>
  );
}

/* ============================================================
   MAIN MODAL COMPONENT (MAX-WIDTH 860PX)
   ============================================================ */

export default function AssignCategoriaModal({ open, setOpen, bsc }) {
  const queryClient = useQueryClient();
  const { data: categorias, isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
    enabled: open
  });

  const [asignadas, setAsignadas] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && bsc?.categorias_detalle) {
      setAsignadas(bsc.categorias_detalle);
    }
  }, [open, bsc]);

  const mutation = useMutation({
    mutationFn: (data) => updateBSC(bsc.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["bsc"]);
      setOpen(false);
    },
  });

  const handleSave = () => {
    mutation.mutate({ categorias: asignadas.map((c) => c.id) });
  };

  const agregarCategoria = (cat) => {
    if (!asignadas.some(c => c.id === cat.id)) {
      setAsignadas([...asignadas, cat]);
    }
  };

  const quitarCategoria = (id) => {
    setAsignadas(asignadas.filter(c => c.id !== id));
  };

  const categoriasFiltradas = useMemo(() => 
    categorias?.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase())) || [],
    [categorias, search]
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = asignadas.findIndex(c => c.id === active.id);
      const newIndex = asignadas.findIndex(c => c.id === over.id);
      setAsignadas(arrayMove(asignadas, oldIndex, newIndex));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full !max-w-[750px] p-0 bg-white border border-[#E5E9EC] rounded-xl shadow-elevated overflow-hidden border-none transition-micro">
        
        {/* HEADER NATALY STYLE */}
        <DialogHeader className="p-6 pb-4 border-b border-[#E5E9EC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F7F9FA] flex items-center justify-center">
              <Layers size={22} className="text-[#0D3B66]" />
            </div>
            <div>
              <DialogTitle className="text-[20px] font-semibold text-[#1A202C]">Asignar Perspectiva al BSC</DialogTitle>
              <p className="text-sm text-[#4A5568]">Proyecto: <span className="font-semibold text-[#0D3B66]">{bsc?.nombre}</span></p>
            </div>
          </div>
        </DialogHeader>

        {/* BODY - DOS COLUMNAS */}
        <div className="grid grid-cols-2 divide-x divide-[#E5E9EC] h-[500px]">
          
          {/* COLUMNA DISPONIBLES */}
          <div className="flex flex-col bg-[#FAFBFC] p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#1A202C] uppercase tracking-wider mb-3">Disponibles</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A5AFB8]" size={16} />
                <Input 
                  className="input-base pl-10 h-[44px]" 
                  placeholder="Buscar categoría..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {isLoading ? (
                <p className="p-4 text-center text-sm text-[#A5AFB8]">Cargando categorías...</p>
              ) : (
                categoriasFiltradas.map(cat => (
                  <CategoryCard 
                    key={cat.id} 
                    cat={cat} 
                    isAssigned={asignadas.some(c => c.id === cat.id)}
                    onAdd={agregarCategoria}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMNA ASIGNADAS (SORTABLE) */}
          <div className="flex flex-col bg-white p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#1A202C] uppercase tracking-wider mb-1">Estructura Asignada</h3>
              <p className="text-xs text-[#A5AFB8]">Arrastra para cambiar el orden de visualización.</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={asignadas.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {asignadas.length === 0 ? (
                      <div className="py-20 text-center text-[#A5AFB8]">
                        <ArrowRight size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No hay categorías asignadas aún.</p>
                      </div>
                    ) : (
                      asignadas.map(cat => (
                        <SortableItem key={cat.id} cat={cat} onRemove={quitarCategoria} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>

        {/* FOOTER NATALY STYLE */}
        <DialogFooter className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E9EC] flex items-center justify-between">
          <span className="text-sm font-medium text-[#4A5568]">
            {asignadas.length} Perspectiva{asignadas.length !== 1 ? 's' : ''} seleccionada{asignadas.length !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)} className="btn-secondary h-[44px]">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={mutation.isPending} className="btn-primary h-[44px] min-w-[140px]">
              {mutation.isPending ? "Guardando..." : "Guardar Estructura"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 