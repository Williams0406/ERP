"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { deleteBSC } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DeleteBSCDialog({ open, setOpen, bsc }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteBSC(bsc.id),
    onSuccess: () => {
      queryClient.invalidateQueries(["bsc"]);
      setOpen(false);
    },
  });

  if (!bsc) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar BSC</DialogTitle>
        </DialogHeader>

        <p>
          ¿Seguro que deseas eliminar el BSC <strong>{bsc.nombre}</strong>?
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
