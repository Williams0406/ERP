"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  LabelList, // Se agregó LabelList
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getIndicador, getIndicadores } from "@/lib/api";

export default function IndicadorDetailView({ indicadorId, onClose }) {
  // Cargar el indicador seleccionado
  const { data: indicador, isLoading } = useQuery({
    queryKey: ["indicador-detail", indicadorId],
    queryFn: () => getIndicador(indicadorId),
  });

  // Cargar todos los indicadores para obtener los hijos
  const { data: todosIndicadores } = useQuery({
    queryKey: ["indicadores-all"],
    queryFn: getIndicadores,
  });

  // Determinar si es hijo y obtener el padre
  const indicadorPadre = useMemo(() => {
    if (!indicador || !todosIndicadores) return null;

    if (indicador.padres && indicador.padres.length > 0) {
      const padreId = indicador.padres[0].id;
      return todosIndicadores.find((ind) => ind.id === padreId);
    }

    return indicador;
  }, [indicador, todosIndicadores]);

  // Obtener los hijos del indicador padre
  const hijosIndicadores = useMemo(() => {
    if (!indicadorPadre || !todosIndicadores) return [];

    if (!indicadorPadre.hijos || indicadorPadre.hijos.length === 0) {
      return [];
    }

    return indicadorPadre.hijos
      .map((hijo) => todosIndicadores.find((ind) => ind.id === hijo.id))
      .filter(Boolean);
  }, [indicadorPadre, todosIndicadores]);

  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    if (!indicadorPadre) return [];

    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const mesesKeys = [
      "ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic",
    ];

    const data = mesesKeys.map((mesKey, idx) => {
      const resultado = indicadorPadre[`${mesKey}_r`] || 0;
      const objetivo = indicadorPadre[`${mesKey}_o`] || 0;
      
      return {
        mes: meses[idx],
        resultado,
        objetivo,
        fill: resultado >= objetivo ? '#22c55e' : '#ef4444'
      };
    });

    data.push({
      mes: "Acum",
      resultado: indicadorPadre.ano_a_la_fecha || 0,
      objetivo: null,
      fill: '#3b82f6'
    });

    return data;
  }, [indicadorPadre]);

  // Preparar datos para la tabla
  const tableData = useMemo(() => {
    if (!indicadorPadre) return [];

    const rows = [];

    rows.push({
      tipo: "indicador",
      nombre: indicadorPadre.indicador || `Indicador ${indicadorPadre.id}`,
      ene: indicadorPadre.ene_r,
      feb: indicadorPadre.feb_r,
      mar: indicadorPadre.mar_r,
      q1: indicadorPadre.q1_r,
      abr: indicadorPadre.abr_r,
      may: indicadorPadre.may_r,
      jun: indicadorPadre.jun_r,
      q2: indicadorPadre.q2_r,
      jul: indicadorPadre.jul_r,
      ago: indicadorPadre.ago_r,
      sep: indicadorPadre.sep_r,
      q3: indicadorPadre.q3_r,
      oct: indicadorPadre.oct_r,
      nov: indicadorPadre.nov_r,
      dic: indicadorPadre.dic_r,
      q4: indicadorPadre.q4_r,
      acum: indicadorPadre.ano_a_la_fecha,
    });

    rows.push({
      tipo: "objetivo",
      nombre: "Objetivo",
      ene: indicadorPadre.ene_o,
      feb: indicadorPadre.feb_o,
      mar: indicadorPadre.mar_o,
      q1: indicadorPadre.q1_o,
      abr: indicadorPadre.abr_o,
      may: indicadorPadre.may_o,
      jun: indicadorPadre.jun_o,
      q2: indicadorPadre.q2_o,
      jul: indicadorPadre.jul_o,
      ago: indicadorPadre.ago_o,
      sep: indicadorPadre.sep_o,
      q3: indicadorPadre.q3_o,
      oct: indicadorPadre.oct_o,
      nov: indicadorPadre.nov_o,
      dic: indicadorPadre.dic_o,
      q4: indicadorPadre.q4_o,
      acum: null,
    });

    hijosIndicadores.forEach((hijo) => {
      rows.push({
        tipo: "indicador-hijo",
        nombre: `  ${hijo.indicador || `Indicador ${hijo.id}`}`,
        ene: hijo.ene_r,
        feb: hijo.feb_r,
        mar: hijo.mar_r,
        q1: hijo.q1_r,
        abr: hijo.abr_r,
        may: hijo.may_r,
        jun: hijo.jun_r,
        q2: hijo.q2_r,
        jul: hijo.jul_r,
        ago: hijo.ago_r,
        sep: hijo.sep_r,
        q3: hijo.q3_r,
        oct: hijo.oct_r,
        nov: hijo.nov_r,
        dic: hijo.dic_r,
        q4: hijo.q4_r,
        acum: hijo.ano_a_la_fecha,
      });

      rows.push({
        tipo: "objetivo-hijo",
        nombre: "  Objetivo",
        ene: hijo.ene_o,
        feb: hijo.feb_o,
        mar: hijo.mar_o,
        q1: hijo.q1_o,
        abr: hijo.abr_o,
        may: hijo.may_o,
        jun: hijo.jun_o,
        q2: hijo.q2_o,
        jul: hijo.jul_o,
        ago: hijo.ago_o,
        sep: hijo.sep_o,
        q3: hijo.q3_o,
        oct: hijo.oct_o,
        nov: hijo.nov_o,
        dic: hijo.dic_o,
        q4: hijo.q4_o,
        acum: null,
      });
    });

    return rows;
  }, [indicadorPadre, hijosIndicadores]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Indicador",
        cell: ({ getValue }) => (
          <div className="font-medium whitespace-pre">{getValue()}</div>
        ),
      },
      { accessorKey: "ene", header: "Ene", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "feb", header: "Feb", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "mar", header: "Mar", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "q1", header: "Q1", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "abr", header: "Abr", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "may", header: "May", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "jun", header: "Jun", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "q2", header: "Q2", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "jul", header: "Jul", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "ago", header: "Ago", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "sep", header: "Sep", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "q3", header: "Q3", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "oct", header: "Oct", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "nov", header: "Nov", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "dic", header: "Dic", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "q4", header: "Q4", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
      { accessorKey: "acum", header: "Acum", cell: ({ getValue }) => getValue()?.toFixed(2) || "-" },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-lg p-6">
          <p className="text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!indicadorPadre) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"  style={{ position: 'relative', zIndex: 10000 }}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold">
              {indicadorPadre.indicador || `Indicador ${indicadorPadre.id}`}
            </h2>
            <p className="text-sm text-gray-500">
              N° {indicadorPadre.n} • {indicadorPadre.dueno}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">
              Resultados vs Objetivos
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "Resultado") return [value?.toFixed(2), name];
                    if (name === "Objetivo") return [value?.toFixed(2), name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="resultado" 
                  name="Resultado"
                  shape={(props) => {
                    const { fill, x, y, width, height } = props;
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={fill}
                      />
                    );
                  }}
                >
                  {/* Se agregó la etiqueta de valor aquí */}
                  <LabelList 
                    dataKey="resultado" 
                    position="insideBottom" 
                    offset={10} 
                    fill="#ffffff"
                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(val) => val.toFixed(1)}
                  />
                </Bar>
                <Line
                  type="monotone"
                  dataKey="objetivo"
                  stroke="#000000"
                  strokeWidth={2}
                  name="Objetivo"
                  dot={{ fill: "#000000", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Resultado ≥ Objetivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Resultado &lt; Objetivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Acumulado</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left font-semibold text-gray-700"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    const rowData = row.original;
                    const isObjetivo = rowData.tipo === "objetivo" || rowData.tipo === "objetivo-hijo";
                    const isHijo = rowData.tipo === "indicador-hijo" || rowData.tipo === "objetivo-hijo";

                    return (
                      <tr
                        key={row.id}
                        className={`
                          border-b hover:bg-gray-50
                          ${isObjetivo ? "bg-blue-50" : ""}
                          ${isHijo ? "text-gray-600" : ""}
                        `}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-2 text-right first:text-left"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-gray-500">Unidad</div>
              <div className="font-semibold">{indicadorPadre.unidad || "-"}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-gray-500">Tipo</div>
              <div className="font-semibold">{indicadorPadre.tipo_de_indicador || "-"}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-gray-500">Condición</div>
              <div className="font-semibold">{indicadorPadre.condicion || "-"}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-gray-500">Método Q</div>
              <div className="font-semibold">{indicadorPadre.metodo_q || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}