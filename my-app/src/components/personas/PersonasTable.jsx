import GenerarTokenButton from "./GenerarTokenButton";
import PersonaModal from "./PersonaModal";
import { deletePersona } from "@/lib/api";

export default function PersonasTable({ personas, onRefresh }) {
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta persona?")) return;
    try {
      await deletePersona(id);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la persona.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E9EC] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F7F9FA] border-b border-[#E5E9EC] text-[#4A5568] font-medium">
            <th className="p-4 text-left">Nombre Completo</th>
            <th className="p-4 text-left">Email corporativo</th>
            <th className="p-4 text-center">Estado Usuario</th>
            <th className="p-4 text-left font-mono">Token de Acceso</th>
            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E9EC]">
          {personas.map((p) => (
            <tr key={p.id} className="hover:bg-[#F7F9FA] transition-colors">
              <td className="p-4 font-medium text-[#1A202C]">
                {p.nombres} {p.apellidos}
              </td>
              <td className="p-4 text-[#4A5568]">{p.email}</td>
              
              <td className="p-4 text-center">
                {p.tiene_usuario ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22A699] bg-opacity-10 text-[#22A699]">
                    ● Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A5AFB8] bg-opacity-10 text-[#4A5568]">
                    ○ Pendiente
                  </span>
                )}
              </td>

              <td className="p-4">
                {p.codigo_registro?.codigo ? (
                  <code className="text-[11px] bg-[#F7F9FA] px-2 py-1 rounded border border-[#E5E9EC] text-[#0D3B66]">
                    {p.codigo_registro.codigo}
                  </code>
                ) : (
                  <span className="text-[#A5AFB8] text-xs">Sin asignar</span>
                )}
              </td>

              <td className="p-4 text-right">
                <div className="flex justify-end items-center gap-3">
                  {!p.tiene_usuario && (
                    <GenerarTokenButton personaId={p.id} onSuccess={onRefresh} />
                  )}
                  
                  <PersonaModal persona={p} onUpdated={onRefresh} />

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-[#DD4A48] hover:text-[#b33a38] p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Eliminar registro"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}