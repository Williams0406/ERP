"use client";

import { useEffect, useState, useMemo } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "@/lib/api";
import CategoryCard from "./components/CategoryCard";
import CategoryFormModal from "./components/CategoryFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal"; // Componente asumido
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, AlertCircle, Tags } from "lucide-react"; // Iconos Lucide

export default function CategoriesPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");

  const loadCategorias = async () => {
    setLoading(true);
    try {
        const data = await getCategorias();
        setCategorias(data);
    } catch (error) {
        console.error("Error al cargar categorías:", error);
        // Manejo de error UI simple
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);


  const filtered = useMemo(() => {
    if (!search) return categorias;
    const lowerSearch = search.toLowerCase();
    return categorias.filter((cat) =>
      cat.nombre.toLowerCase().includes(lowerSearch) || 
      cat.descripcion?.toLowerCase().includes(lowerSearch)
    );
  }, [search, categorias]);


  const handleCreateOrUpdate = async (data) => {
    try {
      if (editing) {
        await updateCategoria(editing.id, data);
      } else {
        await createCategoria(data);
      }
      setShowForm(false);
      setEditing(null);
      await loadCategorias(); // Recargar lista
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      alert(`Error al guardar: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCategoria(deleting.id);
      setDeleting(null);
      await loadCategorias(); // Recargar lista
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert(`Error al eliminar: ${error.response?.data?.detail || error.message}`);
    }
  };


  return (
    <div className="p-6 md:p-10 space-y-8">
      
      {/* 1. HEADER (Títulos 20-32 px, consistente con Enterprise Minimal) */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
            <Tags className="h-8 w-8 text-[#0D3B66]" />
            <h1 className="text-3xl font-bold text-[#0D3B66]">
                Gestión de Perspectivas BSC
            </h1>
        </div>
        <Button 
            onClick={() => setShowForm(true)} 
            className="h-10 px-4 bg-[#0D3B66] hover:bg-[#1E2D3D] transition-colors gap-2"
        >
            <Plus className="h-4 w-4" />
            Nueva Categoría
        </Button>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS (Search) */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-lg">
             <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
             <Input
                // Aplicamos h-11 (44px) y padding izquierdo para el ícono
                placeholder="Buscar por nombre o descripción..."
                className="pl-10 h-11 focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>
      
      {/* 3. CONTENIDO (Listado de Tarjetas) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            <p className="mt-3 text-lg font-medium text-gray-500">Cargando categorías...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
            <AlertCircle className="h-10 w-10 text-gray-400" />
            <p className="mt-3 text-lg font-medium text-gray-500">
                {!search ? "Aún no hay categorías definidas." : `No se encontraron categorías para "${search}"`}
            </p>
            {!search && (
                 <Button onClick={() => setShowForm(true)} variant="link" className="mt-2 text-[#0D3B66]">
                    Crear la primera categoría
                 </Button>
            )}
        </div>
      ) : (
        // Grid con espaciado consistente
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              categoria={cat}
              onEdit={() => {
                setEditing(cat);
                setShowForm(true);
              }}
              onDelete={() => setDeleting(cat)}
            />
          ))}
        </div>
      )}

      {/* MODALES */}
      {showForm && (
        <CategoryFormModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={editing}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          title={`Eliminar Categoría: ${deleting.nombre}`}
          description={`¿Está seguro de que desea eliminar la categoría "${deleting.nombre}"? Esta acción es irreversible y afectará a todos los indicadores asociados.`}
        />
      )}
    </div>
  );
}