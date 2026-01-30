"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBSC, deleteBSC } from "@/lib/api";
import { Button } from "@/components/ui/button";
// Iconos de Lucide Icons (Guía de Diseño)
import { Plus, ListTree, Settings, Loader2 } from "lucide-react"; 

import BSCTree from "./components/BSCTree";
import BSCViewer from "./components/BSCViewer"; // 🔥 Nuevo
import BSCFormModal from "./components/BSCFormModal";
import AssignCategoriaModal from "./components/AssignCategoriaModal";
// import EmptyState from "./components/EmptyState"; // Asumimos que se define localmente o se importa

// Componente para un estado vacío más profesional
const EmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-dashed border-gray-300 rounded-xl mt-8">
    <ListTree className="h-10 w-10 text-gray-400 mb-3" />
    <h3 className="text-xl font-semibold text-gray-800 mb-1">
      No hay Balanced ScoreCards creados
    </h3>
    <p className="text-gray-500 mb-6 text-center">
      Crea tu primer BSC para comenzar a organizar tus categorías e indicadores.
    </p>
    <Button 
      onClick={onCreate}
      className="h-10 px-6 bg-[#0D3B66] hover:bg-[#1E2D3D] transition-colors gap-2"
    >
        <Plus className="h-4 w-4" />
        Nuevo BSC
    </Button>
  </div>
);


export default function BSCPage() {
  const [openForm, setOpenForm] = useState(false);
  const [openAssignCat, setOpenAssignCat] = useState(false);

  const [selected, setSelected] = useState(null);

  // 🔥 Nuevo: BSC seleccionado para ver su tabla
  const [viewerBSCId, setViewerBSCId] = useState(null);

  const queryClient = useQueryClient();

  const { data: bscList, isLoading } = useQuery({
    queryKey: ["bsc"],
    queryFn: getBSC,
  });

  const handleEdit = (item) => {
    setSelected(item);
    setOpenForm(true);
  };

  const handleAssignCategoria = (item) => {
    setSelected(item);
    setOpenAssignCat(true);
  };

  return (
    <div className="p-6 space-y-6"> {/* Más espaciado */}

      {/* ENCABEZADO */}
      {!viewerBSCId && (
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#1E2D3D]">Balanced ScoreCard</h1> {/* Título más grande y color oscuro */}

          <Button
            onClick={() => {
              setSelected(null);
              setOpenForm(true);
            }}
            className="h-10 px-6 bg-[#0D3B66] hover:bg-[#1E2D3D] transition-colors gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo BSC
          </Button>
        </div>
      )}

      {/* 🔥 CAMBIO DE ÁRBOL → VIEWER */}
      {viewerBSCId ? (
        <BSCViewer
          bscId={viewerBSCId}
          onBack={() => setViewerBSCId(null)}
        />
      ) : isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D3B66]" />
        </div>
      ) : bscList?.length === 0 ? (
        <EmptyState onCreate={() => setOpenForm(true)} />
      ) : (
        <BSCTree
          bscList={bscList}
          onEdit={handleEdit}
          onAssignCategoria={handleAssignCategoria}
          onDelete={async (id) => {
            await deleteBSC(id);
            queryClient.invalidateQueries(["bsc"]);
          }}
          onOpenViewer={(id) => setViewerBSCId(id)} // 🔥 Nuevo
        />
      )}

      {/* MODAL FORM BSC */}
      <BSCFormModal 
        open={openForm} 
        setOpen={setOpenForm} 
        bsc={selected} 
        onClose={() => {
          setOpenForm(false);
          setSelected(null);
        }}
      />

      {/* MODAL ASIGNAR CATEGORÍAS */}
      <AssignCategoriaModal
        open={openAssignCat}
        setOpen={setOpenAssignCat}
        bsc={selected}
        onClose={() => {
          setOpenAssignCat(false);
          setSelected(null);
        }}
      />
    </div>
  );
}