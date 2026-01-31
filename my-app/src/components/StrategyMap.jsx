"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategorias, getIndicadores, updateIndicador } from "@/lib/api";
import { DndContext, useDroppable, useDraggable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { 
  TrendingUp, 
  GripVertical, 
  MoreVertical, 
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";

export default function StrategyMap() {
  const queryClient = useQueryClient();

  const { data: categorias, isLoading: loadingCat } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const { data: indicadores, isLoading: loadingInd } = useQuery({
    queryKey: ["indicadores"],
    queryFn: getIndicadores,
  });

  if (loadingCat || loadingInd) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-card rounded-xl border border-border h-80 animate-pulse"
          >
            <div className="h-20 bg-muted/50 rounded-t-xl" />
            <div className="p-6 space-y-4">
              <div className="h-4 bg-muted/50 rounded w-3/4" />
              <div className="h-4 bg-muted/50 rounded w-1/2" />
              <div className="h-4 bg-muted/50 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const categories = categorias?.map((cat) => ({
    ...cat,
    indicadores: indicadores?.filter((ind) =>
      ind.categorias.includes(cat.id)
    ) || [],
  })) || [];

  const onMoveIndicator = async (indicadorId, categoriaId) => {
    try {
      await updateIndicador(indicadorId, {
        categorias: [categoriaId],
      });
      queryClient.invalidateQueries(["indicadores"]);
    } catch (error) {
      console.error("Error al mover indicador:", error);
    }
  };

  return (
    <DndContext
      onDragEnd={(event) => {
        const { over, active } = event;
        if (over && active && over.id !== active.id) {
          onMoveIndicator(active.id, over.id);
        }
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat, index) => (
          <CategoryColumn key={cat.id} category={cat} index={index} />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No hay Perspectivas configuradas
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comienza creando tu primera perspectiva estratégica
          </p>
          <button className="mt-6 flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all mx-auto">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Perspectivas
          </button>
        </div>
      )}
    </DndContext>
  );
}

function CategoryColumn({ category, index }) {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
  });

  const colors = [
    { 
      bg: "from-[#0D3B66] to-[#1a4d7a]", 
      border: "border-[#0D3B66]/20",
      accent: "bg-[#0D3B66]",
      light: "bg-[#0D3B66]/5",
      hover: "hover:border-[#0D3B66]/40"
    },
    { 
      bg: "from-[#22A699] to-[#1a8b7f]", 
      border: "border-[#22A699]/20",
      accent: "bg-[#22A699]",
      light: "bg-[#22A699]/5",
      hover: "hover:border-[#22A699]/40"
    },
    { 
      bg: "from-[#E0A600] to-[#c99000]", 
      border: "border-[#E0A600]/20",
      accent: "bg-[#E0A600]",
      light: "bg-[#E0A600]/5",
      hover: "hover:border-[#E0A600]/40"
    },
    { 
      bg: "from-[#DD4A48] to-[#c43634]", 
      border: "border-[#DD4A48]/20",
      accent: "bg-[#DD4A48]",
      light: "bg-[#DD4A48]/5",
      hover: "hover:border-[#DD4A48]/40"
    },
  ];

  const color = colors[index % colors.length];

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={clsx(
        "rounded-xl border-2 transition-all duration-200",
        "bg-card overflow-hidden shadow-card",
        isOver 
          ? `${color.border} shadow-elevated scale-[1.02]` 
          : `border-border ${color.hover} hover:shadow-card-hover`
      )}
    >
      {/* HEADER */}
      <div className={`bg-gradient-to-r ${color.bg} px-6 py-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base leading-tight">
                {category.nombre}
              </h3>
              <p className="text-white/90 text-xs mt-1 font-medium">
                {category.indicadores.length} indicador{category.indicadores.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>

          <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 transition-micro">
            <MoreVertical className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className={`p-5 min-h-[280px] ${color.light}`}>
        <AnimatePresence mode="popLayout">
          {category.indicadores.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-60 text-center rounded-lg border-2 border-dashed border-border bg-background/50"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color.light} mb-4`}>
                <TrendingUp className={`h-7 w-7 ${color.accent.replace('bg-', 'text-')}`} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Sin indicadores
              </p>
              <p className="text-xs text-muted-foreground">
                Arrastra indicadores aquí o crea uno nuevo
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {category.indicadores.map((ind, idx) => (
                <IndicatorChip 
                  key={ind.id} 
                  indicador={ind} 
                  index={idx}
                  accentColor={color.accent}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground line-clamp-1">
            {category.descripcion || "Sin descripción"}
          </p>
          <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-micro flex items-center gap-1">
            Ver todos
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function IndicatorChip({ indicador, index, accentColor }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: indicador.id,
    });

  const getStatus = () => {
    if (indicador.ano_a_la_fecha === null) {
      return { 
        icon: Clock, 
        color: "text-gray-500", 
        bg: "bg-gray-100", 
        label: "Pendiente",
        trend: null
      };
    }
    
    if (indicador.ano_a_la_fecha >= 85) {
      return { 
        icon: CheckCircle2, 
        color: "text-green-600", 
        bg: "bg-green-50 border-green-200", 
        label: "Óptimo",
        trend: "up"
      };
    }
    
    if (indicador.ano_a_la_fecha >= 70) {
      return { 
        icon: Minus, 
        color: "text-yellow-600", 
        bg: "bg-yellow-50 border-yellow-200", 
        label: "Revisar",
        trend: "neutral"
      };
    }
    
    return { 
      icon: AlertCircle, 
      color: "text-red-600", 
      bg: "bg-red-50 border-red-200", 
      label: "Crítico",
      trend: "down"
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: isDragging ? 1.03 : 1,
      }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
      className={clsx(
        "group relative cursor-grab active:cursor-grabbing",
        "bg-background rounded-lg border border-border",
        "hover:border-border/60 hover:shadow-card transition-all duration-200",
        isDragging && "shadow-elevated opacity-70 rotate-1"
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <GripVertical className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground transition-micro" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-micro">
                  {indicador.indicador}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                    <span className="font-mono">N° {indicador.n}</span>
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {indicador.dueno || "Sin asignar"}
                  </span>
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-all">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {indicador.ano_a_la_fecha !== null && (
              <div className="flex items-end justify-between pt-3 border-t border-border/50">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Acumulado Anual
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {indicador.ano_a_la_fecha?.toFixed(1)}
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      {indicador.unidad || '%'}
                    </span>
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${status.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      {indicador.ano_a_la_fecha !== null && (
        <div className="h-1.5 bg-muted/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((indicador.ano_a_la_fecha || 0), 100)}%` }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`h-full ${accentColor} rounded-br-lg`}
          />
        </div>
      )}
    </motion.div>
  );
}