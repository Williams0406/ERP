import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Tags } from "lucide-react"; // Importamos Lucide Icons

export default function CategoryCard({ categoria, onEdit, onDelete }) {
  return (
    // Diseño Enterprise Minimal: Sombra más pronunciada al interactuar.
    <Card className="shadow-lg border border-border transition-all duration-200 hover:shadow-xl hover:border-blue-300">
      
      {/* HEADER: Iconografía y título */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
            {/* Ícono representativo en caja de color primario sutil */}
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-[#0D3B66]">
                <Tags className="h-5 w-5" />
            </div>
            <div>
                 {/* Título (Subtítulos 16-18 px) */}
                <h3 className="text-lg font-semibold text-foreground">
                    {categoria.nombre}
                </h3>
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Descripción: Tipografía mejorada (Cuerpo 14-15 px) */}
        <p className="text-sm text-muted-foreground min-h-[60px] leading-relaxed">
          {categoria.descripcion || "Sin descripción proporcionada para esta perspectiva BSC."}
        </p>

        {/* FOOTER DE ACCIONES: Más compactos y consistentes */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/50">
          
          {/* Botón Editar */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onEdit}
            className="text-sm text-[#0D3B66] hover:bg-blue-50/50 hover:text-[#1E2D3D] gap-1"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          
          {/* Botón Eliminar */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDelete}
            className="text-sm text-red-600 hover:bg-red-50/50 hover:text-red-700 gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}