"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  getIndicadores,
  createRelacion,
  deleteRelacion,
} from "@/lib/api";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Trash2, LinkIcon, GripVertical } from "lucide-react";


// ========================================================================
// ITEM DRAGGABLE (HIJO) - Estilizado según Estándares NATALY
// ========================================================================
function SortableItem({ item, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white border border-[#E5E9EC] p-2 pr-3 rounded-lg shadow-sm hover:bg-[#F7F9FA] transition-micro group"
    >
      <div className="flex items-center gap-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 text-[#A5AFB8] hover:text-[#4A5568]"
        >
          <GripVertical size={18} />
        </div>
        <span className="text-sm font-medium text-[#1A202C]">
          {item.indicador}
        </span>
      </div>

      <button
        onClick={() => onDelete(item.relacion_id)}
        className="p-2 text-[#DD4A48] hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
        title="Eliminar relación"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}



// ========================================================================
// MODAL PRINCIPAL
// ========================================================================
export default function RelacionCreatorModal({ open, setOpen, indicador }) {
  const queryClient = useQueryClient();
  const indicadorId = indicador?.id ?? null;

  const { data: indicadores } = useQuery({
    queryKey: ["indicadores"],
    queryFn: getIndicadores,
    enabled: open,
  });

  const [hijos, setHijos] = useState([]);
  const [nuevoHijoId, setNuevoHijoId] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!indicadores || !indicadorId) return;

    const hijosActuales = indicadores
      .filter((i) => i.padre === indicadorId)
      .map((h) => ({
        ...h,
        relacion_id: h.relacion_id, 
      }));

    setHijos(hijosActuales);
  }, [indicadores, indicadorId]);

  const mutationCreate = useMutation({
    mutationFn: ({ padre, hijo }) => createRelacion(padre, hijo),
    onSuccess: () => {
      queryClient.invalidateQueries(["indicadores"]);
      setNuevoHijoId("");
    },
  });

  const mutationDelete = useMutation({
    mutationFn: deleteRelacion,
    onSuccess: () => queryClient.invalidateQueries(["indicadores"]),
  });

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = hijos.findIndex((i) => i.id === active.id);
    const newIndex = hijos.findIndex((i) => i.id === over.id);

    const newOrder = arrayMove(hijos, oldIndex, newIndex);
    setHijos(newOrder);
  }

  const handleAdd = () => {
    if (!indicadorId || !nuevoHijoId) return;
    if (hijos.some((h) => h.id === Number(nuevoHijoId))) return;

    mutationCreate.mutate({
      padre: indicadorId,
      hijo: nuevoHijoId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[720px] p-0 bg-white border border-[#E5E9EC] rounded-xl shadow-elevated overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-[#1A202C]">
            <LinkIcon size={20} className="text-[#0D3B66]" /> 
            Administrar Relaciones
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-0 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* SECCIÓN PADRE */}
          <div className="p-4 border border-[#E5E9EC] rounded-xl bg-[#F7F9FA]">
            <p className="text-[13px] font-medium text-[#4A5568] uppercase tracking-wider mb-1">
              Indicador padre
            </p>
            <p className="text-base font-semibold text-[#0D3B66]">
              {indicador?.indicador || "Seleccione un indicador"}
            </p>
          </div>

          {/* SECCIÓN AGREGAR HIJO */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1A202C]">Agregar Nuevo Indicador Hijo</h3>
            <div className="flex gap-3">
              <select
                className="flex-1 h-[44px] px-3 py-2 text-sm bg-white border border-[#E5E9EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D3B66] transition-micro"
                value={nuevoHijoId}
                onChange={(e) => setNuevoHijoId(e.target.value)}
              >
                <option value="">Seleccionar indicador…</option>
                {indicadores
                  ?.filter((i) => i.id !== indicadorId && i.padre !== indicadorId)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.indicador}
                    </option>
                  ))}
              </select>

              <Button
                className="btn-primary h-[44px] px-6"
                onClick={handleAdd}
                disabled={!nuevoHijoId || mutationCreate.isPending}
              >
                {mutationCreate.isPending ? "Agregando..." : "Agregar"}
              </Button>
            </div>
          </div>

          {/* LISTA DE HIJOS EXISTENTES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1A202C]">Indicadores Hijos Relacionados</h3>
              <span className="text-xs font-medium px-2 py-0.5 bg-[#E5E9EC] text-[#4A5568] rounded-full">
                {hijos.length} items
              </span>
            </div>

            <div className="min-h-[100px]">
              {hijos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#E5E9EC] rounded-xl text-[#A5AFB8]">
                  <p className="text-sm">No hay relaciones creadas actualmente.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={hijos.map((h) => h.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {hijos.map((h) => (
                        <SortableItem
                          key={h.id}
                          item={h}
                          onDelete={(relId) => mutationDelete.mutate(relId)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-[#FAFBFC] border-t border-[#E5E9EC] px-6">
          <Button 
            className="btn-secondary h-[44px]" 
            onClick={() => setOpen(false)}
          >
            Cerrar Ventana
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}