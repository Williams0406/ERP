"use client";

import { useEffect, useState, useMemo } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "@/lib/api";
import CategoryCard from "@/components/categorias/CategoryCard";
import CategoryFormModal from "@/components/categorias/CategoryFormModal";
import DeleteConfirmModal from "@/components/categorias/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, Tags, LayoutGrid } from "lucide-react";

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
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategorias(); }, []);

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return categorias.filter(c => c.nombre.toLowerCase().includes(lower) || c.descripcion?.toLowerCase().includes(lower));
  }, [search, categorias]);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#E5E9EC]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#0D3B66]/5 rounded-xl">
            <Tags className="h-6 w-6 text-[#0D3B66]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1A202C]">Perspectivas BSC</h1>
            <p className="text-sm text-[#4A5568]">Organiza los indicadores en dimensiones estratégicas.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A5AFB8]" />
            <Input
              placeholder="Buscar perspectivas..."
              className="pl-10 h-11 border-[#E5E9EC] focus:ring-[#0D3B66] rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowForm(true)} className="btn-primary h-11 gap-2">
            <Plus className="h-4 w-4" />
            Nueva Perspectiva
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-2xl bg-[#FAFBFC]">
          <Loader2 className="h-8 w-8 text-[#0D3B66] animate-spin" />
          <p className="mt-4 text-[#4A5568] font-medium">Cargando catálogo...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#E5E9EC] rounded-2xl bg-white">
          <LayoutGrid className="h-12 w-12 text-[#E5E9EC] mb-4" />
          <p className="text-[#4A5568] text-lg font-medium">No se encontraron resultados</p>
          <Button variant="link" onClick={() => setSearch("")} className="text-[#0D3B66]">Limpiar filtros</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              categoria={cat}
              onEdit={() => { setEditing(cat); setShowForm(true); }}
              onDelete={() => setDeleting(cat)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CategoryFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSubmit={async (data) => {
             editing ? await updateCategoria(editing.id, data) : await createCategoria(data);
             setShowForm(false); setEditing(null); loadCategorias();
          }}
          initialData={editing}
        />
      )}
      {deleting && (
        <DeleteConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={async () => {
          await deleteCategoria(deleting.id); setDeleting(null); loadCategorias();
        }} title={deleting.nombre} />
      )}
    </div>
  );
}