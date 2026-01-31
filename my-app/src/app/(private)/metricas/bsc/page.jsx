"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBSC, deleteBSC } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, ListTree, Loader2, ArrowLeft } from "lucide-react"; 
import BSCTree from "@/components/bsc/BSCTree";
import BSCViewer from "@/components/bsc/BSCViewer";
import BSCFormModal from "@/components/bsc/BSCFormModal";
import AssignCategoriaModal from "@/components/bsc/AssignCategoriaModal";

const EmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center p-16 bg-white border border-dashed border-[#E5E9EC] rounded-2xl animate-fade-in shadow-sm">
    <div className="p-4 bg-[#F7F9FA] rounded-full mb-6">
      <ListTree className="h-10 w-10 text-[#0D3B66]" />
    </div>
    <h3 className="text-xl font-semibold text-[#1A202C] mb-2">Sin Balanced ScoreCards</h3>
    <p className="text-[#4A5568] mb-8 text-center max-w-md">
      Comienza creando una estructura estratégica para visualizar tus KPIs y objetivos por perspectiva.
    </p>
    <Button onClick={onCreate} className="btn-primary h-11 px-8">
      <Plus className="h-4 w-4 mr-2" />
      Crear mi primer BSC
    </Button>
  </div>
);

export default function BSCPage() {
  const [openForm, setOpenForm] = useState(false);
  const [openAssignCat, setOpenAssignCat] = useState(false);
  const [selected, setSelected] = useState(null);
  const [viewerBSCId, setViewerBSCId] = useState(null);
  const queryClient = useQueryClient();

  const { data: bscList, isLoading } = useQuery({ queryKey: ["bsc"], queryFn: getBSC });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      {!viewerBSCId && (
        <div className="flex justify-between items-center pb-6 border-b border-[#E5E9EC]">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A202C]">Balanced ScoreCard</h1>
            <p className="text-sm text-[#4A5568]">Visualización integral del desempeño estratégico.</p>
          </div>
          <Button onClick={() => { setSelected(null); setOpenForm(true); }} className="btn-primary h-11">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo BSC
          </Button>
        </div>
      )}

      {viewerBSCId ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setViewerBSCId(null)} className="hover:bg-white text-[#4A5568] gap-2 p-0">
            <ArrowLeft className="h-4 w-4" /> Volver al listado
          </Button>
          <div className="card bg-white overflow-hidden">
            <BSCViewer bscId={viewerBSCId} />
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#0D3B66]" /></div>
      ) : bscList?.length === 0 ? (
        <EmptyState onCreate={() => setOpenForm(true)} />
      ) : (
        <div className="card p-2 bg-white border-[#E5E9EC]">
          <BSCTree
            bscList={bscList}
            onEdit={(item) => { setSelected(item); setOpenForm(true); }}
            onAssignCategoria={(item) => { setSelected(item); setOpenAssignCat(true); }}
            onDelete={async (id) => { await deleteBSC(id); queryClient.invalidateQueries(["bsc"]); }}
            onOpenViewer={(id) => setViewerBSCId(id)}
          />
        </div>
      )}

      <BSCFormModal open={openForm} setOpen={setOpenForm} bsc={selected} onClose={() => { setOpenForm(false); setSelected(null); }} />
      <AssignCategoriaModal open={openAssignCat} setOpen={setOpenAssignCat} bsc={selected} onClose={() => { setOpenAssignCat(false); setSelected(null); }} />
    </div>
  );
}