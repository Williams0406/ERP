// lib/api.js
import axios from "axios";
import { logout } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

/* ================================
   🔐 SSR SAFE UNAUTHORIZED HANDLER
================================ */
export const onUnauthorized = (callback) => {
  if (typeof window !== "undefined") {
    window.addEventListener("unauthorized", callback);
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      logout();
      window.dispatchEvent(new Event("unauthorized"));
    }
    return Promise.reject(error);
  }
);


// 👉 Adjuntar token automáticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ------- PERSONAS -------
export const createPersona = async (payload) => {
  const res = await api.post("/api/personas/", payload);
  return res.data;
};

export const getPersonas = async () => {
  const res = await api.get("/api/personas/");
  return res.data;
};

export const deletePersona = async (id) => {
  const res = await api.delete(`/api/personas/${id}/`);
  return res.data;
};

export const updatePersona = async (id, payload) => {
  const res = await api.patch(`/api/personas/${id}/`, payload);
  return res.data;
};

// ------- CÓDIGOS DE REGISTRO -------

export const getCodigosRegistro = async () => {
  const res = await api.get("/api/codigos/");
  return res.data;
};

export const createCodigoRegistro = async (personaId) => {
  const res = await api.post("/api/codigos/", {
    persona: personaId,
  });
  return res.data;
};

// ------- REGISTRO USUARIO -------

export const registerUsuario = async (payload) => {
  const res = await api.post("/registro/", payload);
  return res.data;
};

// ------- INDICADORES -------

export const getIndicadores = async () => {
  const res = await api.get("/api/indicadores/");
  return res.data;
};

export const getIndicador = async (id) => {
  const res = await api.get(`/api/indicadores/${id}/`);
  return res.data;
};

export const createIndicador = async (payload) => {
  const res = await api.post("/api/indicadores/", payload);
  return res.data;
};

export const updateIndicador = async (id, payload) => {
  const res = await api.patch(`/api/indicadores/${id}/`, payload);
  return res.data;
};

export const deleteIndicador = async (id) => {
  const res = await api.delete(`/api/indicadores/${id}/`);
  return res.data;
};

// ------- CATEGORÍAS -------

export const getCategorias = async () => {
  const res = await api.get("/api/categorias/");
  return res.data;
};

export const createCategoria = async (payload) => {
  const res = await api.post("/api/categorias/", payload);
  return res.data;
};

// ------- RELACIONES INDICADORREL -------

export const createRelacion = async (indicadorPadreId, indicadorHijoId) => {
  const res = await api.post("/api/indicadores-rel/", {
    indicador_padre: indicadorPadreId,
    indicador_hijo: indicadorHijoId,
  });
  return res.data;
};

export const deleteRelacion = async (relacionId) => {
  const res = await api.delete(`/api/indicadores-rel/${relacionId}/`);
  return res.data;
};

// ------- BSC -------

export const getBSC = async () => {
  const res = await api.get("/api/bsc/");
  return res.data;
};

export const createBSC = async (payload) => {
  const res = await api.post("/api/bsc/", payload);
  return res.data;
};

// ------- CATEGORÍAS -------

export const updateCategoria = async (id, payload) => {
  const res = await api.patch(`/api/categorias/${id}/`, payload);
  return res.data;
};

export const deleteCategoria = async (id) => {
  const res = await api.delete(`/api/categorias/${id}/`);
  return res.data;
};

// ------- BSC -------

export const updateBSC = async (id, payload) => {
  const res = await api.patch(`/api/bsc/${id}/`, payload);
  return res.data;
};

export const deleteBSC = async (id) => {
  const res = await api.delete(`/api/bsc/${id}/`);
  return res.data;
};

// ------- BSC CON INDICADORES -------
export const getBSCWithIndicadores = async (bscId) => {
  const res = await api.get(`/api/bsc/${bscId}/`);
  return res.data;
};

export const getIndicadoresByBSC = async (categorias) => {
  const res = await api.get("/api/indicadores/");
  return res.data.filter(ind => 
    ind.categorias.some(catId => categorias.includes(catId))
  );
};

export default api;
