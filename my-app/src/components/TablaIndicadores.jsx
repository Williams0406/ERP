"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";

import {
  getIndicadores,
  createIndicador,
  updateIndicador,
} from "@/lib/api";
import axios from "axios";

registerAllModules();

export default function TablaIndicadores() {
  const hotRef = useRef(null);
  const [data, setData] = useState([]);

  const columnas = [
    "N", "Indicador", "Pertenencia", "Dueño", "Unidad", "Tipo de indicador", "R/O",
    "Condición", "Año a la fecha",
    "Ene", "Feb", "Mar", "Q1",
    "Abr", "May", "Jun", "Q2",
    "Jul", "Ago", "Sep", "Q3",
    "Oct", "Nov", "Dic", "Q4",
  ];

  // 🔹 1. Cargar datos desde API
  useEffect(() => {
    const fetch = async () => {
      const indicadores = await getIndicadores();

      // 🧼 Si no hay datos en BD → limpiar tabla
      if (!indicadores || indicadores.length === 0) {
        setData([]);
        return;
      }

      const rows = [];

      indicadores.forEach((ind) => {
        const base = {
          N: ind.n,
          Indicador: ind.indicador,
          Dueño: ind.dueno,
          Unidad: ind.unidad,
          "Tipo de indicador": ind.tipo_de_indicador,
          "Condición": ind.condicion,
          "Año a la fecha": ind.ano_a_la_fecha,
          _id: ind.id,
        };

        rows.push({
          ...base,
          "R/O": "Real",
          Ene: ind.ene_r, Feb: ind.feb_r, Mar: ind.mar_r, Q1: ind.q1_r,
          Abr: ind.abr_r, May: ind.may_r, Jun: ind.jun_r, Q2: ind.q2_r,
          Jul: ind.jul_r, Ago: ind.ago_r, Sep: ind.sep_r, Q3: ind.q3_r,
          Oct: ind.oct_r, Nov: ind.nov_r, Dic: ind.dic_r, Q4: ind.q4_r,
        });

        rows.push({
          ...base,
          "R/O": "Objetivo",
          Ene: ind.ene_o, Feb: ind.feb_o, Mar: ind.mar_o, Q1: ind.q1_o,
          Abr: ind.abr_o, May: ind.may_o, Jun: ind.jun_o, Q2: ind.q2_o,
          Jul: ind.jul_o, Ago: ind.ago_o, Sep: ind.sep_o, Q3: ind.q3_o,
          Oct: ind.oct_o, Nov: ind.nov_o, Dic: ind.dic_o, Q4: ind.q4_o,
        });
      });

      setData(rows);
    };

    fetch();
  }, []);

  // 🔹 2. Fusionar celdas Real / Objetivo
  const mergeCells = useMemo(() => {
    const merges = [];
    for (let i = 0; i < data.length; i += 2) {
      const cols = [0,1,2,3,4,5,7,8];
      cols.forEach(c => merges.push({ row: i, col: c, rowspan: 2, colspan: 1 }));
    }
    return merges;
  }, [data]);

  // 🔹 3. Convertir columnas HT → modelo Django
  const mapearCampos = (fila) => {
    const esReal = fila["R/O"] === "Real";
    const suf = esReal ? "_r" : "_o";

    return {
      indicador: fila["Indicador"],
      n: fila["N"],
      dueno: fila["Dueño"],
      unidad: fila["Unidad"],
      tipo_de_indicador: fila["Tipo de indicador"],
      condicion: fila["Condición"],
      ano_a_la_fecha: fila["Año a la fecha"],

      [`ene${suf}`]: fila["Ene"],
      [`feb${suf}`]: fila["Feb"],
      [`mar${suf}`]: fila["Mar"],
      [`abr${suf}`]: fila["Abr"],
      [`may${suf}`]: fila["May"],
      [`jun${suf}`]: fila["Jun"],
      [`jul${suf}`]: fila["Jul"],
      [`ago${suf}`]: fila["Ago"],
      [`sep${suf}`]: fila["Sep"],
      [`oct${suf}`]: fila["Oct"],
      [`nov${suf}`]: fila["Nov"],
      [`dic${suf}`]: fila["Dic"],
      [`q1${suf}`]: fila["Q1"],
      [`q2${suf}`]: fila["Q2"],
      [`q3${suf}`]: fila["Q3"],
      [`q4${suf}`]: fila["Q4"],
    };
  };

  // 🔹 4. Guardar cambios
  const handleAfterChange = async (changes, source) => {
    if (source === "loadData" || !changes) return;

    for (const [row, prop, oldV, newV] of changes) {
      if (oldV === newV) continue;

      const fila = data[row];
      const id = fila._id;

      if (!id) {
        console.warn("⛔ No se puede actualizar una fila sin ID:", fila);
        continue;
      }

      const payload = mapearCampos(fila);

      try {
        await updateIndicador(id, payload);
        console.log("✔️ Actualizado:", id);
      } catch (err) {
        console.error("❌ Error actualizando indicador:", err.response?.data || err);
      }
    }
  };

  // 🔹 5. Agregar indicador
  const agregarFila = async () => {
    const payload = await createIndicador({ indicador: "Nuevo indicador" });

    const real = {
      N: payload.n,
      Indicador: payload.indicador,
      Dueño: payload.dueno || "",
      Unidad: payload.unidad || "",
      "Tipo de indicador": payload.tipo_de_indicador || "",
      "Condición": payload.condicion || "MAYOR",
      "Año a la fecha": payload.ano_a_la_fecha || "2025",
      "R/O": "Real",
      _id: payload.id,
    };

    const objetivo = {
      ...real,
      "R/O": "Objetivo",
      _id: payload.id,      // 👈 IMPORTANTE
    };

    setData([...data, real, objetivo]);
};

  // 🔹 6. ELIMINACIÓN SINCRONIZADA COMPLETA
  const handleAfterRemoveRow = async (index, amount, physicalRows) => {
    try {
      console.log("Filas eliminadas:", physicalRows);

      const idsEliminados = [];

      // Tomamos directamente del estado (NO del hotInstance)
      physicalRows.forEach((rowIndex) => {
        const fila = data[rowIndex];
        if (!fila) return;

        if (fila?._id) idsEliminados.push(fila._id);

        // Eliminar también la fila gemela (Real/Objetivo)
        const isReal = fila["R/O"] === "Real";
        const hermanaIndex = isReal ? rowIndex + 1 : rowIndex - 1;
        const filaHermana = data[hermanaIndex];

        if (filaHermana?._id) idsEliminados.push(filaHermana._id);
      });

      const idsUnicos = [...new Set(idsEliminados)];
      console.log("IDs a eliminar:", idsUnicos);

      // Eliminar en backend
      for (const id of idsUnicos) {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/indicadores/${id}/`);
          console.log(`✔️ Eliminado en backend: ${id}`);
        } catch (err) {
          console.error(`❌ Error eliminando ID ${id}`, err.response?.data);
        }
      }

      // Actualizar tabla eliminando todas las filas del mismo indicador
      setData((prev) =>
        prev.filter((row) => !idsUnicos.includes(row._id))
      );

    } catch (error) {
      console.error("❌ Error en afterRemoveRow:", error);
    }
  };

  // 🔹 Limpia toda la tabla Handsontable
  const limpiarTabla = () => {
    setData([]);

    // Si existe la instancia de Handsontable
    if (hotRef.current) {
      const hot = hotRef.current.hotInstance;

      // Limpiar contenido
      hot.loadData([]);

      // Limpiar merges
      hot.updateSettings({ mergeCells: [] });

      // Forzar un render para evitar artefactos visuales
      hot.render();
    }

    console.log("🧹 Tabla limpiada manualmente.");
  };

  return (
    <div>
      <h2>Balance Scorecard</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: 10 }}>
        <button onClick={agregarFila}>➕ Agregar indicador</button>

        <button
          onClick={limpiarTabla}
          style={{ background: "#d9534f", color: "white", padding: "5px 10px", borderRadius: 4 }}
        >
          🧹 Limpiar tabla
        </button>
      </div>

      <HotTable
        ref={hotRef}
        data={data}
        colHeaders={columnas}
        rowHeaders={false}
        width="100%"
        height={520}
        stretchH="all"
        mergeCells={mergeCells}
        afterChange={handleAfterChange}
        afterRemoveRow={handleAfterRemoveRow}
        manualRowResize
        manualColumnResize
        contextMenu

        minRows={0}
        minSpareRows={0}
        allowInsertRow={false}

        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
}
