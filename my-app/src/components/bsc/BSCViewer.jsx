"use client";

import { useRef, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; 
import { HotTable } from "@handsontable/react-wrapper";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { getBSC, getIndicadores, updateIndicador } from "@/lib/api";
import IndicadorDetailView from "./IndicadorDetailView";

registerAllModules();

export default function BSCViewer({ bscId, onBack }) {
  const hotRef = useRef(null);
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [expandedIndicadores, setExpandedIndicadores] = useState(new Set());
  const [selectedIndicadorId, setSelectedIndicadorId] = useState(null);
  const saveTimeoutRef = useRef(null);

  const { data: bsc, isLoading: loadingBSC } = useQuery({
    queryKey: ["bsc", bscId],
    queryFn: async () => {
      const bscs = await getBSC();
      return bscs.find(b => b.id === parseInt(bscId));
    },
  });

  const { data: indicadores, isLoading: loadingIndicadores, refetch } = useQuery({
    queryKey: ["bsc-indicadores", bscId, bsc?.categorias],
    queryFn: async () => {
      if (!bsc?.categorias || bsc.categorias.length === 0) return [];
      const allIndicadores = await getIndicadores();
      return allIndicadores.filter(ind => 
        ind.categorias.some(catId => bsc.categorias.includes(catId))
      );
    },
    enabled: !!bsc,
  });

  const toggleIndicador = (indicadorId) => {
    setExpandedIndicadores(prev => {
      const newSet = new Set(prev);
      newSet.has(indicadorId) ? newSet.delete(indicadorId) : newSet.add(indicadorId);
      return newSet;
    });
  };

  const prepareTableData = () => {
    if (!bsc || !indicadores) {
      return { data: [], mergeCells: [], rowMapping: [], rowHeaders: [] };
    }
    
    const data = [];
    const mergeCells = [];
    const rowMapping = [];
    const rowHeaders = [];
    let currentRow = 0;

    const indicadoresMap = {};
    indicadores.forEach(ind => { indicadoresMap[ind.id] = ind; });

    const addIndicadorRows = (ind, level = 0) => {
      const rowStart = currentRow;
      const isExpanded = expandedIndicadores.has(ind.id);
      const hasChildren = ind.hijos && ind.hijos.length > 0;
      const indent = '    '.repeat(level);
      const expandIcon = hasChildren ? (isExpanded ? '▼ ' : '▶ ') : '  ';
      
      // FILA R (Resultados)
      data.push([
        ind.n || '', 
        `${indent}${expandIcon}${ind.indicador || ''}`, 
        ind.dueno || '',
        ind.unidad || '', 
        ind.tipo_de_indicador || '', 
        ind.condicion || '', 
        ind.ano_a_la_fecha || '',
        ind.ene_r ?? '', ind.feb_r ?? '', ind.mar_r ?? '', ind.q1_r ?? '', 
        ind.abr_r ?? '', ind.may_r ?? '', ind.jun_r ?? '', ind.q2_r ?? '', 
        ind.jul_r ?? '', ind.ago_r ?? '', ind.sep_r ?? '', ind.q3_r ?? '', 
        ind.oct_r ?? '', ind.nov_r ?? '', ind.dic_r ?? '', ind.q4_r ?? '',
      ]);
      rowMapping.push({ 
        type: 'indicador-r', 
        indicadorId: ind.id, 
        level, 
        hasChildren, 
        condicion: ind.condicion,
        readOnly: hasChildren
      });
      rowHeaders.push('R');

      // FILA O (Objetivos)
      data.push([
        '', '', '', '', '', '', '',
        ind.ene_o ?? '', ind.feb_o ?? '', ind.mar_o ?? '', ind.q1_o ?? '', 
        ind.abr_o ?? '', ind.may_o ?? '', ind.jun_o ?? '', ind.q2_o ?? '', 
        ind.jul_o ?? '', ind.ago_o ?? '', ind.sep_o ?? '', ind.q3_o ?? '', 
        ind.oct_o ?? '', ind.nov_o ?? '', ind.dic_o ?? '', ind.q4_o ?? '',
      ]);
      rowMapping.push({ 
        type: 'indicador-o', 
        indicadorId: ind.id, 
        level, 
        hasChildren,
        readOnly: hasChildren
      });
      rowHeaders.push('O');

      for (let col = 0; col < 7; col++) {
        mergeCells.push({ row: rowStart, col: col, rowspan: 2, colspan: 1 });
      }
      currentRow += 2;

      if (isExpanded && hasChildren) {
        ind.hijos.forEach(hijo => {
          const hijoData = indicadoresMap[hijo.id];
          if (hijoData) addIndicadorRows(hijoData, level + 1);
        });
      }
    };

    if (!bsc.categorias_detalle || bsc.categorias_detalle.length === 0) {
      return { data: [], mergeCells: [], rowMapping: [], rowHeaders: [] };
    }

    bsc.categorias_detalle.forEach(cat => {
      const catIndicadores = indicadores.filter(ind => 
        ind.categorias.includes(cat.id) && (!ind.padres || ind.padres.length === 0)
      );
      
      if (catIndicadores.length === 0) return;

      data.push([cat.nombre, ...Array(22).fill('')]);
      rowMapping.push({ type: 'categoria', categoriaId: cat.id });
      rowHeaders.push('');
      mergeCells.push({ row: currentRow, col: 0, rowspan: 1, colspan: 23 });
      currentRow++;
      
      catIndicadores.forEach(ind => addIndicadorRows(ind, 0));
    });

    return { data, mergeCells, rowMapping, rowHeaders };
  };

  const { data: tableData, mergeCells, rowMapping, rowHeaders } = prepareTableData();

  const cumpleCondicion = (vR, vO, cond) => {
    if (vR === null || vR === '' || vO === null || vO === '') return null;
    return cond === 'MAYOR' ? parseFloat(vR) >= parseFloat(vO) : parseFloat(vR) <= parseFloat(vO);
  };

  // 🚀 SINCRONIZACIÓN INSTANTÁNEA Y SILENCIOSA
  const handleAfterChange = async (changes, source) => {
    if (!changes || source === 'loadData') return;
    
    // Cancelar cualquier guardado pendiente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Guardar inmediatamente sin mostrar indicadores
    const savePromises = changes.map(async ([row, col, oldValue, newValue]) => {
      const mapping = rowMapping[row];
      
      if (!mapping || mapping.type === 'categoria' || mapping.readOnly) return;
      
      const colToField = {
        7: 'ene', 8: 'feb', 9: 'mar',
        11: 'abr', 12: 'may', 13: 'jun',
        15: 'jul', 16: 'ago', 17: 'sep',
        19: 'oct', 20: 'nov', 21: 'dic'
      };
      
      const mesField = colToField[col];
      if (!mesField) return;
      
      const tipo = mapping.type === 'indicador-r' ? 'r' : 'o';
      const fieldName = `${mesField}_${tipo}`;
      
      const payload = {
        [fieldName]: newValue === '' || newValue === null ? null : parseFloat(newValue)
      };
      
      try {
        await updateIndicador(mapping.indicadorId, payload);
      } catch (error) {
        console.error("Error al guardar:", error);
      }
    });
    
    // Ejecutar todos los guardados en paralelo
    await Promise.all(savePromises);
    
    // Refrescar datos después de un pequeño delay para agrupar cambios múltiples
    saveTimeoutRef.current = setTimeout(async () => {
      await refetch();
    }, 500);
  };

  // Actualización optimista: actualizar cache local inmediatamente
  const handleBeforeChange = (changes, source) => {
    if (!changes || source === 'loadData') return;
    
    // Actualizar el cache de React Query inmediatamente para feedback instantáneo
    changes.forEach(([row, col, oldValue, newValue]) => {
      const mapping = rowMapping[row];
      if (!mapping || mapping.type === 'categoria' || mapping.readOnly) return;
      
      const colToField = {
        7: 'ene', 8: 'feb', 9: 'mar',
        11: 'abr', 12: 'may', 13: 'jun',
        15: 'jul', 16: 'ago', 17: 'sep',
        19: 'oct', 20: 'nov', 21: 'dic'
      };
      
      const mesField = colToField[col];
      if (!mesField) return;
      
      const tipo = mapping.type === 'indicador-r' ? 'r' : 'o';
      const fieldName = `${mesField}_${tipo}`;
      
      // Actualizar cache optimistamente
      queryClient.setQueryData(["bsc-indicadores", bscId, bsc?.categorias], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(ind => {
          if (ind.id === mapping.indicadorId) {
            return {
              ...ind,
              [fieldName]: newValue === '' || newValue === null ? null : parseFloat(newValue)
            };
          }
          return ind;
        });
      });
    });
  };

  // Guardar masivo (botón manual)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const hot = hotRef.current.hotInstance;
      const data = hot.getData();
      const updates = {};
      
      rowMapping.forEach((mapping, idx) => {
        if ((mapping.type === 'indicador-r' || mapping.type === 'indicador-o') && !mapping.readOnly) {
          const isR = mapping.type === 'indicador-r';
          const row = data[idx];
          
          if (!updates[mapping.indicadorId]) {
            updates[mapping.indicadorId] = {};
          }
          
          const suffix = isR ? '_r' : '_o';
          updates[mapping.indicadorId][`ene${suffix}`] = row[7] || null;
          updates[mapping.indicadorId][`feb${suffix}`] = row[8] || null;
          updates[mapping.indicadorId][`mar${suffix}`] = row[9] || null;
          updates[mapping.indicadorId][`abr${suffix}`] = row[11] || null;
          updates[mapping.indicadorId][`may${suffix}`] = row[12] || null;
          updates[mapping.indicadorId][`jun${suffix}`] = row[13] || null;
          updates[mapping.indicadorId][`jul${suffix}`] = row[15] || null;
          updates[mapping.indicadorId][`ago${suffix}`] = row[16] || null;
          updates[mapping.indicadorId][`sep${suffix}`] = row[17] || null;
          updates[mapping.indicadorId][`oct${suffix}`] = row[19] || null;
          updates[mapping.indicadorId][`nov${suffix}`] = row[20] || null;
          updates[mapping.indicadorId][`dic${suffix}`] = row[21] || null;
        }
      });
      
      await Promise.all(
        Object.entries(updates).map(([id, payload]) => updateIndicador(id, payload))
      );
      
      await refetch();
    } catch (e) { 
      console.error("Error al guardar:", e); 
      alert("Error al guardar los cambios");
    } finally { 
      setIsSaving(false); 
    }
  };

  // Recargar tabla cuando cambien los datos
  useEffect(() => {
    if (hotRef.current?.hotInstance && tableData && tableData.length > 0) {
      hotRef.current.hotInstance.loadData(tableData);
    }
  }, [bsc, indicadores, expandedIndicadores]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl p-6 border border-[#E5E9EC] shadow-card flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-lg border-[#E5E9EC] hover:bg-[#F7F9FA]">
            <ArrowLeft className="h-4 w-4 text-[#4A5568]" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#1A202C] tracking-tight">{bsc?.nombre}</h1>
            <p className="text-sm text-[#A5AFB8] font-medium">
              Balanced Scorecard Viewer • {indicadores?.length || 0} Indicadores
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()} className="btn-secondary h-10">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="btn-primary h-10 px-6">
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Guardando..." : "Guardar Todo"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E9EC] shadow-elevated overflow-hidden">
        <HotTable
          ref={hotRef}
          data={tableData}
          colHeaders={["N°", "Indicador", "Dueño", "Unidad", "Tipo", "Condición", "Año", "Ene", "Feb", "Mar", "Q1", "Abr", "May", "Jun", "Q2", "Jul", "Ago", "Sep", "Q3", "Oct", "Nov", "Dic", "Q4"]}
          rowHeaders={(index) => {
            const mapping = rowMapping[index];
            const header = rowHeaders[index];
            if (mapping?.type === 'indicador-r') {
              return `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; height: 100%;">
                  <button class="detail-trigger" data-id="${mapping.indicadorId}" style="border:none; background:#0D3B66; color:white; border-radius:4px; width:22px; height:22px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                  </button>
                  <span style="font-weight:700; color:#0D3B66; font-size:10px;">${header}</span>
                </div>`;
            }
            return mapping?.type === 'indicador-o' ? `<span style="font-weight:700; color:#DD4A48; font-size:10px; margin-left:30px;">${header}</span>` : '';
          }}
          colWidths={[
            40, 200, 120, 100, 100, 80, 60,
            60, 60, 60, 60, 60, 60, 60, 60,
            60, 60, 60, 60, 60, 60, 60, 60
          ]}
          columns={[
            { data: 0, readOnly: true, className: 'htCenter htMiddle text-[#4A5568]' },
            { 
              data: 1, readOnly: true, className: 'htMiddle',
              renderer: (inst, td, r, c, p, val) => {
                const mapping = rowMapping[r];
                td.innerHTML = val || '';
                td.style.fontWeight = mapping?.level === 0 ? '600' : '400';
                td.style.color = '#1A202C';
                td.style.paddingLeft = '12px';
                if (mapping?.type === 'indicador-r') td.style.cursor = 'pointer';
                return td;
              }
            },
            { data: 2, readOnly: true, className: 'htMiddle htCenter' },
            { data: 3, readOnly: true, className: 'htMiddle htCenter' },
            { data: 4, readOnly: true, className: 'htMiddle htCenter' },
            { data: 5, readOnly: true, className: 'htMiddle htCenter' }, 
            { data: 6, readOnly: true, className: 'htMiddle htCenter' },
            { data: 7, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 8, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 9, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' },
            { data: 10, type: 'numeric', numericFormat: { pattern: '0,0.00' }, readOnly: true, className: 'htMiddle' },
            { data: 11, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 12, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 13, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' },
            { data: 14, type: 'numeric', numericFormat: { pattern: '0,0.00' }, readOnly: true, className: 'htMiddle' },
            { data: 15, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 16, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 17, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' },
            { data: 18, type: 'numeric', numericFormat: { pattern: '0,0.00' }, readOnly: true, className: 'htMiddle' },
            { data: 19, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 20, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' }, 
            { data: 21, type: 'numeric', numericFormat: { pattern: '0,0.00' }, className: 'htMiddle' },
            { data: 22, type: 'numeric', numericFormat: { pattern: '0,0.00' }, readOnly: true, className: 'htMiddle' },
          ]}
          mergeCells={mergeCells}
          height="650"
          licenseKey="non-commercial-and-evaluation"
          stretchH="all"
          afterOnCellMouseDown={(e, coords) => { 
            if (coords.col === 1) toggleIndicador(rowMapping[coords.row]?.indicadorId); 
          }}
          beforeChange={handleBeforeChange} // 🚀 ACTUALIZACIÓN OPTIMISTA
          afterChange={handleAfterChange} // 🚀 GUARDADO SILENCIOSO
          afterRender={() => {
            document.querySelectorAll('.detail-trigger').forEach(btn => {
              btn.onclick = (e) => { 
                e.stopPropagation(); 
                setSelectedIndicadorId(parseInt(btn.getAttribute('data-id'))); 
              };
            });
          }}
          cells={(row, col) => {
            const props = {};
            const map = rowMapping[row];
            
            // Categorías
            if (mergeCells.some(m => m.row === row && m.colspan === 23)) {
              props.renderer = (inst, td, r, c, p, val) => {
                td.innerHTML = `<div style="text-transform:uppercase; letter-spacing:0.05em;">${val}</div>`;
                td.style.background = '#0D3B66'; 
                td.style.color = 'white'; 
                td.style.fontWeight = '700'; 
                td.style.textAlign = 'center';
                return td;
              };
              props.readOnly = true;
            }
            
            // Columnas Q (trimestres)
            if ([10, 14, 18, 22].includes(col)) {
              props.renderer = (inst, td, r, c, p, val) => {
                td.innerHTML = val ? parseFloat(val).toFixed(2) : '';
                td.style.background = '#F7F9FA'; 
                td.style.textAlign = 'right'; 
                td.style.fontWeight = '700'; 
                td.style.color = '#0D3B66';
                return td;
              };
              props.readOnly = true;
            }
            
            // Indicadores padres (agregados)
            if (map?.readOnly && [7,8,9,11,12,13,15,16,17,19,20,21].includes(col)) {
              props.readOnly = true;
              props.renderer = (inst, td, r, c, p, val) => {
                td.innerHTML = val ? parseFloat(val).toFixed(2) : '';
                td.style.background = '#E8F4F8';
                td.style.textAlign = 'right';
                td.style.color = '#4A5568';
                td.style.fontStyle = 'italic';
                return td;
              };
            }
            
            // Celdas editables con colores
            if (map?.type === 'indicador-r' && !map.readOnly && [7,8,9,11,12,13,15,16,17,19,20,21].includes(col)) {
              props.renderer = (inst, td, r, c, p, val) => {
                const target = inst.getData()[r+1][c];
                const win = cumpleCondicion(val, target, map.condicion);
                td.innerHTML = val ? parseFloat(val).toFixed(2) : '';
                td.style.textAlign = 'right';
                if (win === true) { 
                  td.style.background = '#C6E0B4'; 
                  td.style.color = '#1A202C'; 
                }
                else if (win === false) { 
                  td.style.background = '#FF7575'; 
                  td.style.color = 'white'; 
                }
                return td;
              };
            }
            
            return props;
          }}
        />
      </div>

      {selectedIndicadorId && (
        <IndicadorDetailView 
          indicadorId={selectedIndicadorId} 
          onClose={() => setSelectedIndicadorId(null)} 
        />
      )}
    </div>
  );
}