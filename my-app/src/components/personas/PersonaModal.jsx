"use client";

import { useState, useEffect } from "react";
import { createPersona, updatePersona } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PersonaModal({ onCreated, persona, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (persona) {
      setNombres(persona.nombres);
      setApellidos(persona.apellidos);
      setEmail(persona.email);
    }
  }, [persona]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (persona) {
        await updatePersona(persona.id, { nombres, apellidos, email });
        onUpdated && onUpdated();
      } else {
        const nuevaPersona = await createPersona({ nombres, apellidos, email });
        onCreated && onCreated(nuevaPersona);
      }
      setOpen(false);
    } catch (err) {
      alert("Ocurrió un error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {persona ? (
        <button
          onClick={() => setOpen(true)}
          className="text-[#0D3B66] hover:bg-[#0D3B66] hover:text-white p-1.5 rounded-md transition-all border border-[#0D3B66]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#22A699] hover:bg-[#1b857a] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <span>+</span> Agregar Persona
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 bg-white border border-[#E5E9EC] rounded-xl shadow-elevated overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-lg font-semibold text-[#1A202C]">
              {persona ? "Editar Persona" : "Nueva Persona"}
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="px-6 pb-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#4A5568]">
                Nombres <span className="text-[#DD4A48]">*</span>
              </label>
              <input
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
                className="input-base h-[44px]"
                placeholder="Ej. Juan"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#4A5568]">
                Apellidos <span className="text-[#DD4A48]">*</span>
              </label>
              <input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
                className="input-base h-[44px]"
                placeholder="Ej. Pérez"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#4A5568]">
                Email Institucional <span className="text-[#DD4A48]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!persona?.tiene_usuario}
                className="input-base h-[44px] disabled:bg-[#F7F9FA] disabled:text-[#A5AFB8]"
                placeholder="juan.perez@empresa.com"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E9EC] flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)} className="h-[44px]">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !nombres.trim() || !apellidos.trim() || !email.trim()}
              className="h-[44px]"
            >
              {loading ? "Procesando..." : persona ? "Actualizar Datos" : "Registrar Persona"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
