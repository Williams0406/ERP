export default function UsuariosTable({ usuarios }) {
  // Design Tokens aplicados vía Tailwind y estilos inline limpios
  return (
    <div className="overflow-x-auto bg-white border border-[#E5E9EC] rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
      <table className="w-full text-sm border-collapse" style={{ fontFamily: 'Inter, sans-serif' }}>
        <thead className="bg-[#F7F9FA] border-b border-[#E5E9EC]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-[#0D3B66] h-[40px]">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-[#0D3B66] h-[40px]">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-[#0D3B66] h-[40px]">Creado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E9EC]">
          {usuarios.map((u) => (
            <tr 
              key={u.id} 
              className="hover:bg-[#F5F8FA] transition-colors duration-150 h-[42px]"
            >
              <td className="px-4 py-2 font-medium text-[#1A202C]">
                {u.nombres} {u.apellidos}
              </td>
              <td className="px-4 py-2 text-[#4A5568]">
                {u.email}
              </td>
              <td className="px-4 py-2 text-xs text-[#4A5568]">
                {new Date(u.creado_en).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}