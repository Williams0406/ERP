// lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si NO viene del servidor (sin error.response), evitar log falso
    if (!error.response) {
      console.warn("Non-API error intercepted:", error);
      return Promise.reject(error);
    }

    // Error real del servidor
    console.error("API error:", error.response.data);
    return Promise.reject(error);
  }
);

// ------- INDICADORES -------

export const getIndicadores = async () => {
  const res = await api.get("indicadores/");
  return res.data;
};

export const getIndicador = async (id) => {
  const res = await api.get(`indicadores/${id}/`);
  return res.data;
};

export const createIndicador = async (payload) => {
  const res = await api.post("indicadores/", payload);
  return res.data;
};

export const updateIndicador = async (id, payload) => {
  const res = await api.patch(`indicadores/${id}/`, payload);
  return res.data;
};

export const deleteIndicador = async (id) => {
  const res = await api.delete(`indicadores/${id}/`);
  return res.data;
};

// ------- CATEGORÍAS -------

export const getCategorias = async () => {
  const res = await api.get("categorias/");
  return res.data;
};

export const createCategoria = async (payload) => {
  const res = await api.post("categorias/", payload);
  return res.data;
};

// ------- RELACIONES INDICADORREL -------

export const createRelacion = async (indicadorPadreId, indicadorHijoId) => {
  const res = await api.post("indicadores-rel/", {
    indicador_padre: indicadorPadreId,
    indicador_hijo: indicadorHijoId,
  });
  return res.data;
};

export const deleteRelacion = async (relacionId) => {
  const res = await api.delete(`indicadores-rel/${relacionId}/`);
  return res.data;
};

// ------- BSC -------

export const getBSC = async () => {
  const res = await api.get("bsc/");
  return res.data;
};

export const createBSC = async (payload) => {
  const res = await api.post("bsc/", payload);
  return res.data;
};

// ------- CATEGORÍAS -------

export const updateCategoria = async (id, payload) => {
  const res = await api.patch(`categorias/${id}/`, payload);
  return res.data;
};

export const deleteCategoria = async (id) => {
  const res = await api.delete(`categorias/${id}/`);
  return res.data;
};

// ------- BSC -------

export const updateBSC = async (id, payload) => {
  const res = await api.patch(`bsc/${id}/`, payload);
  return res.data;
};

export const deleteBSC = async (id) => {
  const res = await api.delete(`bsc/${id}/`);
  return res.data;
};

export default api;
