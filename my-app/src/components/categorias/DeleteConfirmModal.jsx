import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmModal({ open, message, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <p className="text-lg font-medium mb-4">{message}</p>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>

          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
