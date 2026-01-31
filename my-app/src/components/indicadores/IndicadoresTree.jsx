"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIndicadores, deleteIndicador } from "@/lib/api";
import { Button } from "@/components/ui/button";
import IndicadorDetailView from "@/components/bsc/IndicadorDetailView";
// Uso de Lucide Icons (Chevron, Trash2, Pencil, Link2, Tags, Info, Layers)
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  Link2,
  Tags,
  Info,
  Layers, 
} from "lucide-react";

export default function IndicadoresTree({ onEdit, onRel, onCategoria }) {
  const queryClient = useQueryClient();
  const [openNodes, setOpenNodes] = useState({});
  const [selectedIndicadorId, setSelectedIndicadorId] = useState(null);
  const [compactView, setCompactView] = useState(false); 

  const { data: indicadores, isLoading } = useQuery({
    queryKey: ["indicadores"],
    queryFn: getIndicadores,
  });

  const mutationDelete = useMutation({
    mutationFn: deleteIndicador,
    onSuccess: () => queryClient.invalidateQueries(["indicadores"]),
  });

  const toggleNode = (id) => {
    // Microinteracción: transición suave al abrir/cerrar (aunque el CSS maneja la animación del contenido)
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Construcción del árbol
  const { roots, childrenById } = useMemo(() => {
    const childrenMap = new Map();
    const allIds = new Set(indicadores?.map((i) => i.id));
    const childIds = new Set();

    if (indicadores) {
      indicadores.forEach((i) => {
        // Mapear hijos
        childrenMap.set(
          i.id,
          i.hijos.map((h) => h.id)
        );

        // Identificar IDs que son hijos
        i.hijos.forEach((h) => childIds.add(h.id));
      });
    }

    // Raíces = todos los IDs que NO están en la lista de hijos
    const rootIds = Array.from(allIds).filter((id) => !childIds.has(id));
    const rootsData = indicadores
      ? indicadores.filter((i) => rootIds.includes(i.id))
      : [];

    return { roots: rootsData, childrenById: childrenMap };
  }, [indicadores]);

  if (isLoading) {
    return (
      <div className="text-gray-500 flex items-center justify-center p-10">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0D3B66] border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando jerarquía de indicadores...</p>
        </div>
      </div>
    );
  }

  // UI/UX: Función auxiliar para color del KPI (usando Secondary de la guía: #22A699)
  const getKpiColor = (kpiText) => {
    if (!kpiText) return null;
    return "bg-[#22A699]/10 text-[#0D3B66] border border-[#22A699]/50"; // Usamos Primary para el texto, Secundario para el fondo sutil
  }

  // Renderizado del árbol
  const renderTree = (indicador, level = 0, visited = new Set()) => {
    if (visited.has(indicador.id)) {
      // Evitar ciclos infinitos
      return null;
    }
    visited.add(indicador.id);

    const childIds = childrenById.get(indicador.id) || [];
    const isOpen = openNodes[indicador.id];

    // Recursión
    const childNodes = childIds
      .map((cid) => indicadores.find((i) => i.id === cid))
      .filter(Boolean)
      .map((child) => renderTree(child, level + 1, new Set(visited)));

    const kpiTexto =
      indicador.ano_a_la_fecha !== null
        ? `KPI: ${indicador.ano_a_la_fecha} ${indicador.unidad || "%"}`
        : null;
    
    const kpiClass = getKpiColor(kpiTexto);
    const categorias = indicador.categorias_detalle || [];

    const categoriasCompactas = categorias.slice(0, compactView ? 1 : 2);
    const categoriasExtra = categorias.length - categoriasCompactas.length;

    return (
      <div key={indicador.id} className="mb-0.5">
        {/* Nodo */}
        <div
          // Diferenciación de fondo: Raíz (nivel 0) más prominente
          className={`flex rounded-lg px-3 py-2 transition-all border border-gray-200
            ${
              level === 0
                ? "bg-white shadow-sm hover:shadow-md" // Nivel 0: fondo blanco con sombra
                : "bg-gray-50 hover:bg-gray-100" // Sub-niveles: fondo gris muy claro
            }
          `}
        >
          <div className="flex items-start gap-2 flex-1">
            {/* Toggle (Caret animado) */}
            {childNodes.length > 0 ? (
              <button
                onClick={() => toggleNode(indicador.id)}
                className="mt-1 p-0.5 rounded transition flex-shrink-0 text-[#0D3B66] hover:text-gray-700"
              >
                {/* Ícono de Chevron más pequeño (size=16) */}
                {isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              // Espaciador para mantener la alineación cuando no hay hijos
              <span className="w-5 mt-1 flex-shrink-0" />
            )}

            {/* Contenido del nodo */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Primera fila: Nombre y Acciones */}
              <div className="flex items-center justify-between w-full gap-3 flex-wrap">
                {/* IZQUIERDA: Meta-datos y Nombre */}
                <div className="flex items-center gap-3 flex-shrink min-w-0">
                  <span className="font-semibold text-sm line-clamp-1 text-[#1E2D3D]"> {/* Color de texto más oscuro para sobriedad */}
                    {indicador.indicador || "Sin nombre"}
                  </span>
                  
                  {/* Identificador con tipografía mono para sobriedad (etiqueta 12-13px) */}
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                      N° {indicador.n}
                  </span>

                  {/* Etiqueta de Nivel */}
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
                    Nivel {level}
                  </span>
                </div>

                {/* DERECHA: Acciones (Botones compactos, estilo ghost/icono) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Botón Principal (Info): usa color Primario (#0D3B66) */}
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-[#0D3B66] hover:bg-[#0D3B66]/90 text-white shadow-sm" 
                    onClick={() => setSelectedIndicadorId(indicador.id)}
                    title="Ver detalle del indicador"
                  >
                    <Info size={14} />
                  </Button>

                  {/* Botones secundarios: estilo Ghost/Icono compacto */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-gray-600 hover:bg-gray-200"
                    onClick={() => onRel(indicador)}
                    title="Gestionar relaciones"
                  >
                    <Link2 size={14} />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-gray-600 hover:bg-gray-200"
                    onClick={() => onCategoria(indicador)}
                    title="Asignar categorías"
                  >
                    <Tags size={14} />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-gray-600 hover:bg-gray-200"
                    onClick={() => onEdit(indicador)}
                    title="Editar indicador"
                  >
                    <Pencil size={14} />
                  </Button>

                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de eliminar el indicador N° ${indicador.n} - ${indicador.indicador}?`)) {
                          mutationDelete.mutate(indicador.id);
                      }
                    }}
                    title="Eliminar indicador"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Segunda fila (Detalle - visible en vista detallada) */}
              {!compactView && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {/* KPI Chip (con color secundario #22A699) */}
                  {kpiTexto && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kpiClass}`}>
                      {kpiTexto}
                    </span>
                  )}
                  {/* Chips de Categorías (etiquetas 12-13px) */}
                  {categoriasCompactas.length > 0 ? (
                    <>
                      {categoriasCompactas.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200"
                        >
                          {c.nombre}
                        </span>
                      ))}
                      {categoriasExtra > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-500">
                          +{categoriasExtra}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Sin categorías asignadas
                    </span>
                  )}
                </div>
              )}

              {/* Vista compacta (solo nombre y una categoría) */}
              {compactView && categorias.length > 0 && (
                <div className="mt-0.5 text-xs text-gray-400">
                  <span className="text-[#0D3B66]">
                    {categorias[0]?.nombre}
                  </span>
                  {categorias.length > 1 && ` • +${categorias.length - 1} más`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estilo explorador: Hijos con línea guía vertical (ml-6 border-l pl-4) */}
        {isOpen && childNodes.length > 0 && (
          // Línea guía vertical más visible y con más padding para claridad
          <div className="mt-0.5 ml-6 border-l-2 border-dashed border-gray-200 pl-4">
            {childNodes}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="IndicadoresTree">
      {/* Top Bar */}
      <div className="mt-4 mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Mostrando {indicadores?.length || 0} indicadores.
        </span>

        {/* Botón para cambiar vista con ícono contextual */}
        <Button
          type="button"
          onClick={() => setCompactView((prev) => !prev)}
          variant="outline"
          size="sm"
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition gap-1.5"
        >
          <Layers size={14} />
          Vista {compactView ? "Detallada" : "Compacta"}
        </Button>
      </div>

      <div className="space-y-2">
        {roots.length === 0 && (
          <p className="text-sm text-gray-500 p-4 border rounded-lg bg-gray-50">
            No hay indicadores registrados. Crea uno para empezar la jerarquía.
          </p>
        )}
        {roots.map((root) => renderTree(root))}
      </div>

      {/* Panel lateral (Modal de Detalle) */}
      {selectedIndicadorId && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-200"
          onClick={() => setSelectedIndicadorId(null)}
        >
          <div
            // El comentario problemático ha sido ELIMINADO de esta sección.
            className="bg-white w-[700px] max-h-[85vh] rounded-xl shadow-2xl border p-6 overflow-y-auto
                      animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <IndicadorDetailView
              indicadorId={selectedIndicadorId}
              onClose={() => setSelectedIndicadorId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}