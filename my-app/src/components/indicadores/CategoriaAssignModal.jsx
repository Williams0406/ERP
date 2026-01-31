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
  getCategorias,
  getIndicadores,
  updateIndicador,
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

/**
 * Calcula todos los indicadores relacionados (padres/hijos)
 * como un “grupo” usando BFS sobre hijos + padres.
 */
function getGrupoRelacionados(indicadorId, indicadores) {
  if (!indicadorId || !indicadores?.length) return [indicadorId];

  // Crear grafo no dirigido basado en hijos/padres
  const adj = new Map();

  const ensure = (id) => {
    if (!adj.has(id)) adj.set(id, new Set());
    return adj.get(id);
  };

  indicadores.forEach((ind) => {
    ensure(ind.id);

    ind.hijos?.forEach((h) => {
      ensure(h.id);
      ensure(ind.id).add(h.id);
      ensure(h.id).add(ind.id);
    });

    ind.padres?.forEach((p) => {
      ensure(p.id);
      ensure(ind.id).add(p.id);
      ensure(p.id).add(ind.id);
    });
  });

  // BFS
  const visitados = new Set();
  const cola = [indicadorId];
  visitados.add(indicadorId);

  while (cola.length) {
    const actual = cola.shift();
    const vecinos = adj.get(actual) || [];
    vecinos.forEach((v) => {
      if (!visitados.has(v)) {
        visitados.add(v);
        cola.push(v);
      }
    });
  }

  return Array.from(visitados);
}

// Estilos customizados para react-select basados en Design Tokens
const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        height: '44px',
        minHeight: '44px',
        padding: '0 8px',
        borderRadius: '8px',
        borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-neutral-300)',
        boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-primary)',
            opacity: state.isFocused ? 1 : 1, // Quitamos opacidad de hover para más claridad
        },
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: 'var(--color-primary)',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: 'white',
        fontSize: '14px',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: 'white',
        '&:hover': {
            backgroundColor: 'var(--color-primary-dark)',
            color: 'white',
        },
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--color-neutral-500)',
        fontSize: '14px',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--color-neutral-900)',
        fontSize: '14px',
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '14px',
        backgroundColor: state.isSelected 
            ? 'var(--color-primary)' 
            : state.isFocused 
            ? 'var(--color-neutral-100)' 
            : 'white',
        color: state.isSelected ? 'white' : 'var(--color-neutral-700)',
    }),
};


export default function CategoriaAssignModal({ open, setOpen, indicador }) {
  const queryClient = useQueryClient();

  // Cargar categorías
  const { data: categorias, isLoading: loadingCats } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Cargar indicadores para poder calcular el grupo relacional
  const { data: indicadores, isLoading: loadingInds } = useQuery({
    queryKey: ["indicadores"],
    queryFn: getIndicadores,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async (categoriasSeleccionadas) => {
      if (!indicador?.id) return;

      // 1. IDs del grupo (padre + hijos + relacionados)
      const grupoIds = getGrupoRelacionados(indicador.id, indicadores);

      // 2. Actualizar TODOS con las mismas categorías
      await Promise.all(
        grupoIds.map((id) =>
          updateIndicador(id, { categorias: categoriasSeleccionadas })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["indicadores"]);
      setOpen(false);
    },
    onError: (error) => {
      console.error("Error al actualizar las categorías en el grupo:", error);
      alert("Error al actualizar las categorías en el grupo. Revise la conexión o los permisos.");
    },
  });

  if (!indicador) return null;

  const categoriasActuales =
    indicador.categorias_detalle?.map((c) => ({
      value: c.id,
      label: c.nombre,
    })) || [];

  const isLoading = loadingCats || loadingInds;
  const isUpdating = mutation.isLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="max-w-md w-full p-0 bg-white rounded-xl shadow-lg" // Eliminamos el padding para aplicarlo en los subcomponentes
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <DialogHeader className="p-6 pb-0 border-b-0">
          <DialogTitle className="text-xl font-semibold text-color-neutral-900">
            Asignar categorías al grupo
          </DialogTitle>
          <p className="text-sm" style={{ color: 'var(--color-neutral-700)'}}>
            Las categorías seleccionadas se aplicarán a este indicador y a todos
            los indicadores relacionados (padres e hijos).
          </p>
        </DialogHeader>

        <div className="pt-4 px-6 pb-4"> {/* Padding interno 24px (px-6) */}
          {isLoading && <p className="text-sm">Cargando datos...</p>}

          {!isLoading && categorias && (
            <Select
              isMulti
              className="mb-6"
              placeholder="Selecciona categorías..."
              isDisabled={isUpdating}
              defaultValue={categoriasActuales}
              onChange={(opts) => {
                const ids = opts.map((o) => o.value);
                mutation.mutate(ids);
              }}
              options={categorias.map((c) => ({
                value: c.id,
                label: c.nombre,
              }))}
              styles={customSelectStyles}
            />
          )}
        </div>

        <DialogFooter 
            className="flex justify-end pt-4" 
            style={{ 
                backgroundColor: '#FAFBFC', 
                borderTop: '1px solid var(--color-neutral-300)',
                padding: '16px 24px',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px' 
            }}
        >
          {/* Usamos un botón primario para la acción principal si se selecciona algo, y secundario para cerrar */}
          <Button
            className="btn-secondary h-[44px]"
            onClick={() => setOpen(false)}
            disabled={isUpdating}
          >
            {isUpdating ? "Guardando..." : "Cerrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}