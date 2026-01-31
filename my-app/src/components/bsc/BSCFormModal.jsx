"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBSC, updateBSC } from "@/lib/api";
import { Settings, Loader2, Save, X } from "lucide-react";

export default function BSCFormModal({ open, setOpen, bsc, onClose }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      nombre: bsc?.nombre || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      bsc ? updateBSC(bsc.id, data) : createBSC(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["bsc"]);
      onClose();
      reset();
    },
    onError: (error) => {
        console.error("Error al guardar BSC:", error);
    }
  });

  const onSubmit = (formData) => {
    const payload = {
      nombre: formData.nombre,
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[480px] p-0 bg-white border border-[#E5E9EC] rounded-xl shadow-elevated overflow-hidden border-none transition-micro">
        
        {/* HEADER CON ESTILO NATALY */}
        <DialogHeader className="p-6 pb-4 border-b border-[#E5E9EC] bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D3B66] to-[#092C4D] flex items-center justify-center shadow-sm">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-[20px] font-semibold text-[#1A202C]">
                {bsc ? "Configurar Balanced ScoreCard" : "Nuevo Balanced ScoreCard"}
              </DialogTitle>
              <p className="text-[13px] text-[#A5AFB8] mt-0.5">
                {bsc ? "Actualice el nombre de su proyecto estratégico" : "Defina el nombre para su nueva estructura estratégica"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* CUERPO DEL FORMULARIO */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 bg-white">
          
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#4A5568] block px-1">
              Nombre del BSC <span className="text-[#DD4A48]">*</span>
            </label>
            <input
              className="input-base h-[44px] px-4 border-[#E5E9EC] focus:border-[#0D3B66] focus:ring-1 focus:ring-[#0D3B66]/10"
              placeholder="Ej: Plan Estratégico de Operaciones 2024"
              {...register("nombre", { required: true })}
            />
            <p className="text-[11px] text-[#A5AFB8] px-1">
              Este nombre será visible en la cabecera de su Dashboard general.
            </p>
          </div>

          {/* FOOTER - ACCIONES */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#FAFBFC]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="btn-secondary h-[44px] px-6 text-[#4A5568] hover:bg-[#F7F9FA]"
            >
              Cancelar
            </Button>
            
            <Button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary h-[44px] px-8 flex items-center gap-2 shadow-sm active:scale-[0.98]"
            >
              {mutation.isPending ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sincronizando...</span>
                </>
              ) : (
                <>
                    <Save className="h-4 w-4" />
                    <span>{bsc ? "Actualizar" : "Crear ScoreCard"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}