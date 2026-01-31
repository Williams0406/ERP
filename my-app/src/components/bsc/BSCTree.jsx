"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash,
  Tags,
  Eye,
  MoreVertical,
  Layers,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BSCTree({
  bscList,
  onEdit,
  onAssignCategoria,
  onDelete,
  onOpenViewer,
}) {
  const [openNodes, setOpenNodes] = useState({});
  const [hoveredBSC, setHoveredBSC] = useState(null);

  const toggleNode = (id) => {
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = (bsc) => {
    if (window.confirm(`¿Eliminar "${bsc.nombre}"? Esta acción no se puede deshacer.`)) {
      onDelete(bsc.id);
    }
  };

  return (
    <div className="space-y-3">
      {bscList.map((bsc, index) => {
        const isOpen = openNodes[bsc.id] ?? false;
        const isHovered = hoveredBSC === bsc.id;

        return (
          <motion.div
            key={`bsc-${bsc.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredBSC(bsc.id)}
            onMouseLeave={() => setHoveredBSC(null)}
            className="bg-white rounded-xl border border-[#E5E9EC] hover:border-[#0D3B66]/30 transition-all duration-140 shadow-card hover:shadow-card-hover"
          >
            {/* HEADER BSC */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                {/* LEFT SECTION */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* EXPAND/COLLAPSE BUTTON */}
                  <button
                    onClick={() => toggleNode(bsc.id)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F9FA] transition-colors duration-140"
                    aria-label={isOpen ? "Colapsar" : "Expandir"}
                  >
                    <motion.div
                      animate={{ rotate: isOpen ? 0 : -90 }}
                      transition={{ duration: 0.14 }}
                    >
                      <ChevronDown size={18} className="text-[#4A5568]" />
                    </motion.div>
                  </button>

                  {/* BSC ICON */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#0D3B66] to-[#092C4D] flex items-center justify-center">
                    <Layers size={20} className="text-white" />
                  </div>

                  {/* BSC INFO */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] font-semibold text-[#1A202C] truncate">
                      {bsc.nombre}
                    </h3>
                    <p className="text-[13px] text-[#A5AFB8] mt-0.5">
                      {bsc.categorias_detalle?.length || 0} categoría
                      {bsc.categorias_detalle?.length !== 1 ? 's' : ''} asignada
                      {bsc.categorias_detalle?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* RIGHT SECTION - ACTIONS */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.14 }}
                      className="flex items-center gap-2"
                    >
                      {/* VER BSC */}
                      <Button
                        size="sm"
                        onClick={() => onOpenViewer(bsc.id)}
                        className="h-9 px-3 bg-gradient-to-r from-[#0D3B66] to-[#092C4D] hover:from-[#092C4D] hover:to-[#0D3B66] text-white transition-all duration-140"
                      >
                        <Eye size={14} className="mr-1.5" />
                        <span className="text-[13px] font-medium">Ver</span>
                      </Button>

                      {/* CATEGORÍAS */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAssignCategoria(bsc)}
                        className="h-9 px-3 border-[#E5E9EC] hover:bg-[#F7F9FA] hover:border-[#0D3B66]/30 transition-all duration-140"
                      >
                        <Tags size={14} className="mr-1.5 text-[#22A699]" />
                        <span className="text-[13px] font-medium text-[#4A5568]">
                          Categorías
                        </span>
                      </Button>

                      {/* EDITAR */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(bsc)}
                        className="h-9 w-9 p-0 border-[#E5E9EC] hover:bg-[#F7F9FA] hover:border-[#0D3B66]/30 transition-all duration-140"
                      >
                        <Pencil size={14} className="text-[#4A5568]" />
                      </Button>

                      {/* ELIMINAR */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(bsc)}
                        className="h-9 w-9 p-0 border-[#E5E9EC] hover:bg-red-50 hover:border-[#DD4A48] transition-all duration-140"
                      >
                        <Trash size={14} className="text-[#DD4A48]" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CATEGORÍAS EXPANDIBLES */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-[#E5E9EC] pt-3">
                      {bsc.categorias_detalle && bsc.categorias_detalle.length > 0 ? (
                        <div className="space-y-2">
                          {bsc.categorias_detalle.map((cat, idx) => (
                            <motion.div
                              key={`cat-${cat.id}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F9FA] border border-[#E5E9EC] hover:border-[#22A699]/30 hover:bg-[#E0FBF6]/20 transition-all duration-140 group"
                            >
                              {/* CATEGORY ICON */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#22A699] to-[#1a8b7f] flex items-center justify-center">
                                <FolderOpen size={16} className="text-white" />
                              </div>

                              {/* CATEGORY INFO */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-medium text-[#1A202C] truncate">
                                  {cat.nombre}
                                </p>
                                {cat.descripcion && (
                                  <p className="text-[12px] text-[#A5AFB8] mt-0.5 truncate">
                                    {cat.descripcion}
                                  </p>
                                )}
                              </div>

                              {/* CATEGORY ID BADGE */}
                              <div className="flex-shrink-0 px-2 py-1 rounded-md bg-white border border-[#E5E9EC] group-hover:border-[#22A699]/30 transition-all duration-140">
                                <span className="text-[11px] font-semibold text-[#A5AFB8]">
                                  #{cat.id}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 rounded-full bg-[#F7F9FA] flex items-center justify-center mx-auto mb-2">
                            <Tags size={20} className="text-[#A5AFB8]" />
                          </div>
                          <p className="text-[13px] text-[#A5AFB8]">
                            Sin categorías asignadas
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAssignCategoria(bsc)}
                            className="mt-3 h-8 text-[12px] border-[#E5E9EC] hover:bg-[#F7F9FA] hover:border-[#0D3B66]/30"
                          >
                            <Tags size={12} className="mr-1.5" />
                            Asignar categorías
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}